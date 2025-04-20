import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import type { Status } from "@prisma/client";

export const userRouter = createTRPCRouter({
  createUser: publicProcedure
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
      const user = await ctx.db.user.findUnique({ where: { id: input.id } });

      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      if (input.id != ctx.session.userId) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      return await ctx.db.user.delete({ where: { id: input.id } });
    }),

  // update user profile
  updateUserProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).optional(),
        bio: z.string().optional(),
        image: z.string().url().nullable().optional(), // null = remove photo
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updatedUser = await ctx.db.user.update({
        where: { id: ctx.session.userId },
        data: {
          name: input.name,
          bio: input.bio,
          image: input.image, // frontend already handles fallback
        },
      });

      return updatedUser;
    }),


  //get my own profile 
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        createdAt: true,
      },
    });

    return user;
  }),

  //get my listings
  getMyListings: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.listing.findMany({
      where: { userId: ctx.session.userId },
      orderBy: {
        createdAt: "desc", // optional but helpful
      },
      select: {
        id: true,
        title: true,
        price: true,
        imageUrls: true, // Changed from imageUrl to imageUrls
        condition: true,
        status: true,
      },
    });
  }),

  //get my reviews
  getMyReviews: protectedProcedure.query(async ({ ctx }) => {
    const reviews = await ctx.db.review.findMany({
      where: { targetUserId: ctx.session.userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        rating: true,
        content: true,
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const total = reviews.length;
    const averageRating = total > 0
      ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1))
      : null;

    return { reviews, averageRating };
  }),


  // get listings of other users 
  getOtherUserListings: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const listings = await ctx.db.listing.findMany({
        where: {
          userId: input.userId,
        },
      });

      const statusPriority: Record<Status, number> = {
        AVAILABLE: 0,
        RESERVED: 1,
        SOLD: 2,
      };

      listings.sort((a, b) => {
        const statusCompare = statusPriority[a.status] - statusPriority[b.status];
        if (statusCompare !== 0) return statusCompare;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
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
          createdAt: true,
        },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      return user;
    }),
})