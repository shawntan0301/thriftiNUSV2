import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const reviewRouter = createTRPCRouter({
  createReview: protectedProcedure
    .input(
      z.object({
        targetUserId: z.string(),
        content: z.string().min(1),
        rating: z.number().int().min(1).max(5),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.targetUserId === ctx.session.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot review yourself.",
        });
      }

      const existing = await ctx.db.review.findFirst({
        where: {
          authorId: ctx.session.userId,
          targetUserId: input.targetUserId,
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You have already reviewed this user.",
        });
      }

      return await ctx.db.review.create({
        data: {
          ...input,
          authorId: ctx.session.userId,
        },
      });
    }),

  editReview: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        content: z.string().min(1),
        rating: z.number().int().min(1).max(5),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const review = await ctx.db.review.findUnique({
        where: { id: input.id },
      });

      if (!review || review.authorId !== ctx.session.userId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Review not found or not yours to edit.",
        });
      }

      return await ctx.db.review.update({
        where: { id: input.id },
        data: {
          content: input.content,
          rating: input.rating,
        },
      });
    }),

  deleteReview: protectedProcedure
    .input(z.string()) // review ID
    .mutation(async ({ ctx, input }) => {
      const review = await ctx.db.review.findUnique({
        where: { id: input },
      });

      if (!review || review.authorId !== ctx.session.userId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Review not found or not yours to delete.",
        });
      }

      return await ctx.db.review.delete({
        where: { id: input },
      });
    }),

  getUserReview: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.review.findMany({
        where: {
          targetUserId: input.userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          author: true,
        },
      });
    }),
});
