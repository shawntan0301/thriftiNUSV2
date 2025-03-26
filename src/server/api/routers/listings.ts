import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
    createTRPCRouter,
    publicProcedure,
    protectedProcedure,
} from "~/server/api/trpc";

export const listingsRouter = createTRPCRouter({

    // Create a listing (must be logged in)
    createListing: protectedProcedure
        .input(
            z.object({
                title: z.string().min(1),
                description: z.string().min(1),
                price: z.number().nonnegative(),
                imageUrl: z.string().url(),
                category: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            return await ctx.db.listing.create({
                data: {
                    ...input,
                    userId: ctx.session.userId,
                },
            });
        }),

    editListing: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                title: z.string().optional(),
                description: z.string().optional(),
                price: z.number().optional(),
                imageUrl: z.string().optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const user = await ctx.db.user.findUnique({ where: { id: input.id } });
            const listing = await ctx.db.listing.findUnique({
                where: { id: input.id },
            });

            if (!listing) throw new TRPCError({ code: "NOT_FOUND", message: "Listing not found" });
            if (listing.userId !== user?.id) throw new TRPCError({ code: "NOT_FOUND", message: "Listing not found" });

            return await ctx.db.listing.update({
                where: { id: input.id },
                data: {
                    title: input.title,
                    description: input.description,
                    price: input.price,
                    imageUrl: input.imageUrl,
                },
            });
        }),

    // Delete a listing
    deleteListing: protectedProcedure
        .input(z.string())
        .mutation(async ({ ctx, input }) => {
            const listing = await ctx.db.listing.findUnique({ where: { id: input } });

            if (!listing) throw new TRPCError({ code: "NOT_FOUND", message: "Listing not found" });
            if (listing.userId !== ctx.session.userId) throw new TRPCError({ code: "NOT_FOUND", message: "Listing not found" });

            return await ctx.db.listing.delete({ where: { id: input } });
        }),

    // Get a single listing by ID 
    getSingleListing: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const listing = await ctx.db.listing.findUnique({
                where: { id: input.id },
                include: { user: true },
            });

            if (!listing) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Listing not found" });
            }

            return listing;
        }),

    // Get all listings
    getAllListings: publicProcedure
        .query(async ({ ctx }) => {
            return await ctx.db.listing.findMany({
                orderBy: { createdAt: "desc" },
                include: { user: true },
            });
        }),

    // Get all listings by the current user
    getAllListingsById: protectedProcedure
        .query(async ({ ctx }) => {
            return await ctx.db.listing.findMany({
                where: { userId: ctx.session.userId },
            });
        }),

    // Search listings by keyword (can consider adding search everytime a letter is written)
    searchListings: publicProcedure
        .input(z.object({ query: z.string().min(1) }))
        .query(async ({ ctx, input }) => {
            const results = await ctx.db.listing.findMany({
                where: {
                    OR: [
                        { title: { contains: input.query, mode: "insensitive" } },
                        { description: { contains: input.query, mode: "insensitive" } },
                    ],
                },
                orderBy: { createdAt: "desc" },
                include: { user: true },
            });

            return results;
        }),

    // Filter listings by category (check)
    filterListingsByCategory: publicProcedure
        .input(z.object({ category: z.string() }))
        .query(async ({ ctx, input }) => {
            const listings = await ctx.db.listing.findMany({
                where: {
                    category: input.category,
                },
                orderBy: { createdAt: "desc" },
                include: { user: true },
            });

            return listings;
        }),

});
