import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";

export const adminRouter = createTRPCRouter({
  getAnalytics: protectedProcedure
    .input(z.void())
    .query(async ({ ctx }) => {
      // Check if user is admin
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.userId },
        select: { isAdmin: true },
      });

      if (!user?.isAdmin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only admins can access analytics",
        });
      }

      // Get total users
      const totalUsers = await ctx.db.user.count();

      // Get total listings
      const totalListings = await ctx.db.listing.count();

      // Get total conversations
      const totalConversations = await ctx.db.conversation.count();

      // Get total reports
      const totalReports = await ctx.db.report.count();

      // Get listings by category
      const listingsByCategory = await ctx.db.listing.groupBy({
        by: ["category"],
        _count: true,
      });

      // Get listings by condition
      const listingsByCondition = await ctx.db.listing.groupBy({
        by: ["condition"],
        _count: true,
      });

      // Get listings by status
      const listingsByStatus = await ctx.db.listing.groupBy({
        by: ["status"],
        _count: true,
      });

      // Get reports by status
      const reportsByStatus = await ctx.db.report.groupBy({
        by: ["reportStatus"],
        _count: true,
      });

      return {
        totalUsers,
        totalListings,
        totalConversations,
        totalReports,
        listingsByCategory,
        listingsByCondition,
        listingsByStatus,
        reportsByStatus,
      };
    }),

  getUsers: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user is admin
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.userId },
        select: { isAdmin: true },
      });

      if (!user?.isAdmin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only admins can access user management",
        });
      }

      const where: Prisma.UserWhereInput = {
        ...(input.search
          ? {
              OR: [
                { name: { contains: input.search, mode: "insensitive" as Prisma.QueryMode } },
                { email: { contains: input.search, mode: "insensitive" as Prisma.QueryMode } },
              ],
            }
          : {}),
      };

      const users = await ctx.db.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true,
          isAdmin: true,
          receivedReviews: {
            select: {
              rating: true,
            },
          },
        },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
        orderBy: {
          createdAt: "desc",
        },
      });

      const total = await ctx.db.user.count({ where });

      return {
        users: users.map((user) => ({
          ...user,
          reviewCount: user.receivedReviews.length,
          averageRating: user.receivedReviews.length > 0
            ? user.receivedReviews.reduce((sum, review) => sum + review.rating, 0) / user.receivedReviews.length
            : null,
        })),
        total,
        pages: Math.ceil(total / input.limit),
      };
    }),
}); 