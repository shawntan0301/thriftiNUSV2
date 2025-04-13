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

    //getConversationsForUser
    getConversationsForUser: protectedProcedure
        .query(async ({ ctx }) => {
            return await ctx.db.conversation.findMany({
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
                            price: true
                        }
                    }
                },
                orderBy: {
                    updatedAt: 'desc'
                    
                }
            });
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
                            price: true
                        }
                    }
                }
            });


            return conversation;
        })
});