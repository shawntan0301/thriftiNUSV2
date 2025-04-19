import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { OfferStatus } from "@prisma/client";

export const offerRouter = createTRPCRouter({
  // buyer creates a new offer
  createOffer: protectedProcedure
    .input(
      z.object({
        listingId: z.string(),
        amount: z.number().positive(),
        message: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const buyerId = ctx.session.userId;

      //reject any prior pending offers by this buyer on that listing
      await ctx.db.offer.updateMany({
        where: {
          listingId: input.listingId,
          buyerId,
          status: OfferStatus.PENDING,
        },
        data: { status: OfferStatus.REJECTED },
      });

      const newOffer = await ctx.db.offer.create({
        data: {
          listingId: input.listingId,
          buyerId,
          amount: input.amount,
          message: input.message,
          status: OfferStatus.PENDING,
        },
      });

      return newOffer;
    }),

  // buyer deletes their own offer
  deleteOffer: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const buyerId = ctx.session.userId;
      const offer = await ctx.db.offer.findUnique({ where: { id: input } });
      if (!offer || offer.buyerId !== buyerId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Offer not found" });
      }
      return await ctx.db.offer.delete({ where: { id: input } });
    }),

  // seller rejects an offer
  rejectOffer: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const sellerId = ctx.session.userId;
      const offer = await ctx.db.offer.findUnique({
        where: { id: input },
        include: { listing: true },
      });
      if (!offer || offer.listing.userId !== sellerId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not the seller of this listing",
        });
      }
      return await ctx.db.offer.update({
        where: { id: input },
        data: { status: OfferStatus.REJECTED },
      });
    }),

  // seller accepts an offer. after accepting it, reject other offers and mark listing sold
  acceptOffer: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const sellerId = ctx.session.userId;
      const offer = await ctx.db.offer.findUnique({
        where: { id: input },
        include: { listing: true },
      });
      if (!offer || offer.listing.userId !== sellerId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not the seller of this listing",
        });
      }

      const acceptedOffer = await ctx.db.offer.update({
        where: { id: input },
        data: { status: OfferStatus.ACCEPTED },
      });

      await ctx.db.offer.updateMany({
        where: {
          listingId: offer.listingId,
          id: { not: input },
          status: OfferStatus.PENDING,
        },
        data: { status: OfferStatus.REJECTED },
      });

      await ctx.db.listing.update({
        where: { id: offer.listingId },
        data: { status: "SOLD" },
      });

      return acceptedOffer;
    }),

  // fetch latest offer for this listing + user (buyer)
  getLatestOfferForConversation: protectedProcedure
    .input(
      z.object({
        listingId: z.string(),
        buyerId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const offer = await ctx.db.offer.findFirst({
        where: {
          listingId: input.listingId,
          buyerId: input.buyerId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return offer;
    }),



});
