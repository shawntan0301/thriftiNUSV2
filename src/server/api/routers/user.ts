import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";
import { z } from "zod";

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

            if (!user) throw new Error("User not found");
            if (input.id != ctx.session.userId) throw new Error("Unauthorized");

            return await ctx.db.user.delete({ where: { id: input.id }});
        })

    //updateUser

})