import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
    createTRPCRouter,
    publicProcedure,
    protectedProcedure
} from "~/server/api/trpc";

export const conversationRouter = createTRPCRouter({

    //startConversations
    startConversation: protectedProcedure
        .input(
            z.object({
                receiverId: z.string(),
                initialMessage: z.string().min(1),
                listingId: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            return await ctx.db.conversation.create({
                data: {
                    buyerId: ctx.session.userId, 
                    sellerId: input.receiverId,
                    listingId: input.listingId,
                    messages: {
                        create: {
                            content: input.initialMessage,
                            senderId: ctx.session.userId
                        }
                    }
                }
            });
        }),

    // get or start for OthersListingPanel
    getOrCreateConversation: protectedProcedure
        .input(
            z.object({
            receiverId: z.string(),
            listingId: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const existing = await ctx.db.conversation.findFirst({
            where: {
                buyerId: ctx.session.userId,
                sellerId: input.receiverId,
                listingId: input.listingId,
            },
            });

            if (existing) return existing;

            const listing = await ctx.db.listing.findUnique({
            where: { id: input.listingId },
            });

            if (!listing) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Listing does not exist.",
            });
            }

            return await ctx.db.conversation.create({
            data: {
                buyerId: ctx.session.userId,
                sellerId: input.receiverId,
                listingId: input.listingId,
            },
            });
        }),

      

    // getConversationsForUser
    getConversationsForUser: protectedProcedure.query(async ({ ctx }) => {
        // For regular users, return only their conversations
        const conversations = await ctx.db.conversation.findMany({
            where: {
                OR: [
                    { buyerId: ctx.session.userId },
                    { sellerId: ctx.session.userId },
                ],
            },
            include: {
                buyer: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
                seller: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
                messages: {
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 1, // preview 1 message
                },
                listing: {
                    select: {
                        id: true,
                        title: true,
                        imageUrls: true,
                        price: true,
                        status: true,
                        offers: {
                            orderBy: { createdAt: 'desc' },
                            take: 1, // just get latest offer
                        },
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc' // Sort by most recent activity
            },
        });

        return conversations;
    }),
  

    //sendMessage
    sendMessage: protectedProcedure
        .input(
            z.object({
                conversationId: z.string(),
                content: z.string().min(1)
            })
        )
        .mutation(async ({ ctx, input }) => {
            const conversation = await ctx.db.conversation.findFirst({
                where: {
                    id: input.conversationId,
                    OR: [
                        { buyerId: ctx.session.userId },
                        { sellerId: ctx.session.userId }
                    ]
                }
            });

            const message = await ctx.db.message.create({
                data: {
                    content: input.content,
                    senderId: ctx.session.userId,
                    conversationId: input.conversationId
                }
            });

            
            await ctx.db.conversation.update({
                where: { id: input.conversationId },
                data: { updatedAt: new Date() }
            });
            

            return message;
        }),

    //getFullConversation
    getFullConversation: protectedProcedure
        .input(
            z.object({
                conversationId: z.string()
            })
        )
        .query(async ({ ctx, input }) => {
            // Check if user is admin
            const user = await ctx.db.user.findUnique({
                where: { id: ctx.session.userId },
                select: { isAdmin: true }
            });

            // If user is not admin, check if they are part of the conversation
            if (!user?.isAdmin) {
                const conversation = await ctx.db.conversation.findFirst({
                    where: {
                        id: input.conversationId,
                        OR: [
                            { buyerId: ctx.session.userId },
                            { sellerId: ctx.session.userId }
                        ]
                    },
                    include: {
                        buyer: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                            },
                        },
                        seller: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                            },
                        },
                        messages: {
                            orderBy: {
                                createdAt: "asc",
                            },
                            include: {
                                sender: {
                                    select: {
                                        id: true,
                                        name: true,
                                        image: true,
                                    },
                                },
                            },
                        },
                        listing: {
                            select: {
                                id: true,
                                title: true,
                                price: true,
                                imageUrls: true,
                                status: true,
                            },
                        },
                    },
                });

                if (!conversation) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Conversation not found or you don't have access to it",
                    });
                }

                return conversation;
            }

            // For admin users, allow access to any conversation
            const conversation = await ctx.db.conversation.findUnique({
                where: {
                    id: input.conversationId,
                },
                include: {
                    buyer: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        },
                    },
                    seller: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        },
                    },
                    messages: {
                        orderBy: {
                            createdAt: "asc",
                        },
                        include: {
                            sender: {
                                select: {
                                    id: true,
                                    name: true,
                                    image: true,
                                },
                            },
                        },
                    },
                    listing: {
                        select: {
                            id: true,
                            title: true,
                            price: true,
                            imageUrls: true,
                            status: true,
                        },
                    },
                },
            });

            if (!conversation) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Conversation not found",
                });
            }

            return conversation;
        }),

    // Get all conversations (admin only)
    getAllConversations: protectedProcedure
        .query(async ({ ctx }) => {
            // Check if user is admin
            const user = await ctx.db.user.findUnique({
                where: { id: ctx.session.userId },
                select: { isAdmin: true }
            });

            if (!user?.isAdmin) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Only admins can access all conversations",
                });
            }

            const conversations = await ctx.db.conversation.findMany({
                include: {
                    buyer: {
                        select: {
                            id: true,
                            name: true,
                            image: true
                        }
                    },
                    seller: {
                        select: {
                            id: true,
                            name: true,
                            image: true
                        }
                    },
                    messages: {
                        include: {
                            sender: {
                                select: {
                                    id: true,
                                    name: true,
                                    image: true
                                }
                            }
                        },
                        orderBy: {
                            createdAt: 'asc'
                        }
                    },
                    listing: {
                        select: {
                            id: true,
                            title: true,
                            imageUrls: true,
                            price: true,
                            status: true,
                        }
                    }
                },
                orderBy: {
                    updatedAt: 'desc'
                }
            });

            // Create a unique key for each conversation based on listing, buyer, and seller
            const uniqueConversations = conversations.reduce((acc, curr) => {
                const key = `${curr.listingId}-${curr.buyerId}-${curr.sellerId}`;
                if (!acc[key] || acc[key].updatedAt < curr.updatedAt) {
                    acc[key] = curr;
                }
                return acc;
            }, {} as Record<string, typeof conversations[0]>);

            return Object.values(uniqueConversations);
        }),
});