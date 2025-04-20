import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Category, Condition, DealMethod, Status } from "@prisma/client";

export const listingsRouter = createTRPCRouter({
  createListing: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        price: z.number().nonnegative(),
        imageUrls: z.array(z.string().url()),
        brand: z.string().optional(),
        category: z.nativeEnum(Category),
        condition: z.nativeEnum(Condition),
        dealMethods: z.array(z.nativeEnum(DealMethod)),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.listing.create({
        data: {
          ...input,
          userId: ctx.session.userId
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
        imageUrls: z.array(z.string().url()).optional(), // Changed from imageUrl to imageUrls
        brand: z.string().optional(),
        category: z.nativeEnum(Category).optional(),
        condition: z.nativeEnum(Condition).optional(),
        dealMethods: z.array(z.nativeEnum(DealMethod)).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.db.listing.findUnique({
        where: { id: input.id },
      });

      if (!listing || listing.userId !== ctx.session.userId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found or not owned by user",
        });
      }

      return await ctx.db.listing.update({
        where: { id: input.id },
        data: {
          title: input.title,
          description: input.description,
          price: input.price,
          imageUrls: input.imageUrls, // Changed from imageUrl to imageUrls
          brand: input.brand,
          category: input.category,
          condition: input.condition,
          dealMethods: input.dealMethods,
        },
      });
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["available", "reserved", "sold"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Find the listing first
      const listing = await ctx.db.listing.findUnique({ where: { id: input.id } });

      // Check if listing exists and belongs to the user
      if (!listing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found",
        });
      }

      if (listing.userId !== ctx.session.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authorized to update this listing",
        });
      }

      // Update and return the listing with new status
      return await ctx.db.listing.update({
        where: { id: input.id },
        data: { status: input.status.toUpperCase() as Status },
      });
    }),


  // Delete a listing
  deleteListing: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.db.listing.findUnique({ where: { id: input } });

      if (!listing)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found",
        });
      if (listing.userId !== ctx.session.userId)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found",
        });

      return await ctx.db.listing.delete({ where: { id: input } });
    }),

  // Deletes any listing (action can only be performed by admin)
  deleteAnyListing: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const userRole = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.userId,
        },
        select: {
          isAdmin: true
        }
      })

      if (!userRole?.isAdmin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User is not admin"
        })
      }

      const listing = await ctx.db.listing.findUnique({ where: { id: input } });

      if (!listing)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found",
        });
      if (listing.userId !== ctx.session.userId)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found",
        });

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
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found",
        });
      }

      return listing;
    }),

  // Get all listings
  getAllListings: publicProcedure.query(async ({ ctx }) => {
    const listings = await ctx.db.listing.findMany({
      include: { user: true },
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

  // Get all listings by the current user
  getAllListingsById: protectedProcedure.query(async ({ ctx }) => {
    const listings = await ctx.db.listing.findMany({
      where: { userId: ctx.session.userId },
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

  // Search listings by keyword (can consider adding search everytime a letter is written)
  filterSearchSortListings: publicProcedure
  .input(
    z.object({
      query: z.string().optional(),
      category: z.nativeEnum(Category).optional(),
      condition: z.nativeEnum(Condition).optional(),
      priceSort: z.enum(["asc", "desc"]).optional(),
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
    })
  )
  .query(async ({ ctx, input }) => {
    const { query, category, condition, priceSort, minPrice, maxPrice } = input;

    let listings = await ctx.db.listing.findMany({
      where: {
        AND: [
          query
            ? {
                OR: [
                  { title: { contains: query, mode: "insensitive" } },
                  { description: { contains: query, mode: "insensitive" } },
                  { brand: { contains: query, mode: "insensitive" } },
                ],
              }
            : {},
          category ? { category } : {},
          condition ? { condition } : {},
          minPrice !== undefined ? { price: { gte: minPrice } } : {},
          maxPrice !== undefined ? { price: { lte: maxPrice } } : {},
        ],
      },
      include: { user: true },
    });

    const statusPriority: Record<Status, number> = {
      AVAILABLE: 0,
      RESERVED: 1,
      SOLD: 2,
    };

    listings.sort((a, b) => {
      const statusCompare = statusPriority[a.status] - statusPriority[b.status];
      if (statusCompare !== 0) return statusCompare;

      if (priceSort) {
        return priceSort === "asc"
          ? a.price - b.price
          : b.price - a.price;
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return listings;
  }),


  // Filter listings by category
  filterListingsByCategory: publicProcedure
    .input(
      z.object({
        category: z.nativeEnum(Category),
      }),
    )
    .query(async ({ ctx, input }) => {
      const listings = await ctx.db.listing.findMany({
        where: {
          category: input.category,
        },
        include: { user: true },
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
});
