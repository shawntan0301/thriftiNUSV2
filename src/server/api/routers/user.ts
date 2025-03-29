import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
    
    createUser: protectedProcedure
        .input(
        z.object({
            id: z.string(),
            name: z.string(),
            email: z.string().email(),
            emailVerified: z.date().nullable().optional(),
            image: z.string().nullable().optional(),
        })
    )
    .mutation(async ({ ctx, input }) => {
        return await ctx.db.user.create({
            data: {
                ...input,
            },
        });
    }),

    deleteUser: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const user = await ctx.db.user.findUnique({ where: { id: input.id }});

            if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
            if (input.id != ctx.session.userId) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

            return await ctx.db.user.delete({ where: { id: input.id }});
        }),

    //updateUser 
    updateUserProfile: protectedProcedure
        .input(
            z.object({
                name: z.string().min(1).optional(),
                bio: z.string().optional(),
                image: z.string().url().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const updatedUser = await ctx.db.user.update({
                where: { id: ctx.session.userId },
                data: {
                    name: input.name,
                    //test if original empty bio will give error upon editting another empty bio
                    bio: input.bio,
                    image: input.image,
                },
            });

            return updatedUser;
        }),


    //get my own profile 
    getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
        const user = await ctx.db.user.findUnique({
            where: { id: ctx.session.userId },
        });
    
        return user;
    }),
    
    //get my listings
    getMyListings: protectedProcedure
        .query(async ({ ctx }) => {
            return await ctx.db.user.findMany({
            where: { id: ctx.session.userId },
            });
        }),

    // get listings of other users 
    getOtherUserListings: publicProcedure
        .input(z.object({ userId: z.string() }))
        .query(async ({ ctx, input }) => {
            const listings = await ctx.db.listing.findMany({
                where: {
                    userId: input.userId,
                },
                orderBy: {
                    createdAt: "desc",
                },
            });

            return listings;
        }),

    //gets other user profile by id 
    getOtherUserById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const user = await ctx.db.user.findUnique({
                where: { id: input.id },
                select: {
                    id: true,
                    name: true,
                    image: true,
                    bio: true, // optional
                },
            });
    
            if (!user) {
                throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
            }
    
            return user;
        }),
    

})