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

      

    //getConversationsForUser
    getConversationsForUser: protectedProcedure
        .query(async ({ ctx }) => {
            const conversations = await ctx.db.conversation.findMany({
                where: {
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
                        orderBy: {
                            createdAt: 'desc'
                        },
                        take: 1 // i think the use case for this function is "view all chats"? so only need 1 msg to preview the chat
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
                }
            });

            // sort by latest messsage time
            const sorted = conversations.sort((a, b) => {
                const aTime = a.messages[0]?.createdAt ?? a.updatedAt;
                const bTime = b.messages[0]?.createdAt ?? b.updatedAt;
                return bTime.getTime() - aTime.getTime(); // descending
              });
            
              return sorted;
            
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
                }
            });


            return conversation;
        })
});