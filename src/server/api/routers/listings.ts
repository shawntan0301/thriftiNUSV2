import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const listingsRouter = createTRPCRouter({
    // Get all listings
    getAllListing: publicProcedure.query(async ({ ctx }) => {
      return await ctx.db.listing.findMany({
        orderBy: { createdAt: "desc" },
        include: { user: true }, // optional, to show seller info
      });
    }),
  
    // Get listing by ID
    getAllListingById: protectedProcedure.query(async ({ ctx }) => {
      return await ctx.db.listing.findMany({
        where: { userId: ctx.session.userId },
      });
    }),
  
    // Create a listing (must be logged in)
    createListing: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1),
          description: z.string().min(1),
          price: z.number().nonnegative(),
          imageUrl: z.string().url(),
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
        const user = await ctx.db.user.findUnique({ where: { id: input.id }});
        const listing = await ctx.db.listing.findUnique({
          where: { id: input.id },
        });
  
        if (!listing) throw new Error("Listing not found");
        if (listing.userId !== user?.id) throw new Error("Not your listing");
        
  
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

    // Delete a listing (optional)
    deleteListing: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
      const listing = await ctx.db.listing.findUnique({ where: { id: input } });
  
      if (!listing) throw new Error("Listing not found");
      if (listing.userId !== ctx.session.userId) throw new Error("Unauthorized");
  
      return await ctx.db.listing.delete({ where: { id: input } });
    }),
  });
  