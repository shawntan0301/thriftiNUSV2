import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import { subDays, subMonths, subYears } from "date-fns";

const CLERK_API_BASE = "https://api.clerk.com/v1";

export const adminRouter = createTRPCRouter({
  getAnalytics: protectedProcedure
    .input(z.void())
    .query(async ({ ctx }) => {
      // Check if user is admin using Clerk
      const response = await fetch(`${CLERK_API_BASE}/users/${ctx.session.userId}`, {
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to verify admin status",
        });
      }

      const clerkUser = await response.json();
      if (!clerkUser.public_metadata?.role || clerkUser.public_metadata.role !== "admin") {
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
        statusFilter: z.enum(["all", "active", "admin", "banned"]).default("all"),
        reviewsFilter: z.enum(["all", "0", "1-5", "6-10", "10+"]).default("all"),
        accountAgeFilter: z.enum(["all", "today", "week", "month", "year"]).default("all"),
        ratingFilter: z.enum(["all", "5", "4", "3", "2", "1"]).default("all"),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user is admin using Clerk
      const adminCheckResponse = await fetch(`${CLERK_API_BASE}/users/${ctx.session.userId}`, {
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!adminCheckResponse.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to verify admin status",
        });
      }

      const adminUser = await adminCheckResponse.json();
      if (!adminUser.public_metadata?.role || adminUser.public_metadata.role !== "admin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only admins can access user management",
        });
      }

      // Get all users from Clerk first
      const clerkResponse = await fetch(`${CLERK_API_BASE}/users`, {
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!clerkResponse.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch users from Clerk",
        });
      }

      const clerkUsers = await clerkResponse.json();
      
      // Get users from database with review counts
      const dbUsers = await ctx.db.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true,
          _count: {
            select: {
              receivedReviews: true
            }
          },
          receivedReviews: {
            select: {
              rating: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Merge Clerk and DB user data
      const mergedUsers = dbUsers.map(dbUser => {
        const clerkUser = clerkUsers.find((cu: any) => cu.id === dbUser.id);
        return {
          ...dbUser,
          banned: clerkUser?.banned ?? false,
          isAdmin: clerkUser?.public_metadata?.role === "admin",
          reviewCount: dbUser._count.receivedReviews,
          averageRating: dbUser.receivedReviews.length > 0
            ? dbUser.receivedReviews.reduce((sum, review) => sum + review.rating, 0) / dbUser.receivedReviews.length
            : null,
        };
      });

      // Apply filters
      let filteredUsers = mergedUsers;

      // Search filter
      if (input.search) {
        const searchLower = input.search.toLowerCase();
        filteredUsers = filteredUsers.filter(user => 
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
        );
      }

      // Status filter
      if (input.statusFilter !== "all") {
        filteredUsers = filteredUsers.filter(user => {
          switch (input.statusFilter) {
            case "active":
              return !user.isAdmin && !user.banned;
            case "admin":
              return user.isAdmin;
            case "banned":
              return user.banned;
            default:
              return true;
          }
        });
      }

      // Reviews filter
      if (input.reviewsFilter !== "all") {
        filteredUsers = filteredUsers.filter(user => {
          const reviewCount = user.reviewCount;
          switch (input.reviewsFilter) {
            case "0":
              return reviewCount === 0;
            case "1-5":
              return reviewCount >= 1 && reviewCount <= 5;
            case "6-10":
              return reviewCount >= 6 && reviewCount <= 10;
            case "10+":
              return reviewCount > 10;
            default:
              return true;
          }
        });
      }

      // Account age filter
      if (input.accountAgeFilter !== "all") {
        const now = new Date();
        let dateFilter: Date;
        switch (input.accountAgeFilter) {
          case "today":
            dateFilter = subDays(now, 1);
            break;
          case "week":
            dateFilter = subDays(now, 7);
            break;
          case "month":
            dateFilter = subMonths(now, 1);
            break;
          case "year":
            dateFilter = subYears(now, 1);
            break;
          default:
            dateFilter = now;
        }
        filteredUsers = filteredUsers.filter(user => 
          new Date(user.createdAt) >= dateFilter
        );
      }

      // Rating filter
      if (input.ratingFilter !== "all") {
        const minRating = parseInt(input.ratingFilter);
        filteredUsers = filteredUsers.filter(user => 
          user.averageRating !== null && user.averageRating >= minRating
        );
      }

      // Apply pagination
      const paginatedUsers = filteredUsers.slice(
        (input.page - 1) * input.limit,
        input.page * input.limit
      );

      return {
        users: paginatedUsers,
        total: filteredUsers.length,
        pages: Math.ceil(filteredUsers.length / input.limit),
      };
    }),
}); 