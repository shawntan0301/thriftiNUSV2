import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
    createTRPCRouter,
    publicProcedure,
    protectedProcedure,
} from "~/server/api/trpc";
import { ReportStatus, ReportTopic } from "@prisma/client";

export const reportsRouter = createTRPCRouter({
    // 1. Create a report (with optional listingId)
    createReport: protectedProcedure
        .input(
            z.object({
                reporteeId: z.string(),
                listingId: z.string().optional(),
                reportType: z.array(z.nativeEnum(ReportTopic)),
                bodyText: z.string().min(1),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Ensure user isn't reporting themselves
            if (input.reporteeId === ctx.session.userId) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "You cannot report yourself",
                });
            }

            // Check if reportee exists
            const reportee = await ctx.db.user.findUnique({
                where: { id: input.reporteeId },
            });

            if (!reportee) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User being reported not found",
                });
            }

            // Check if listing exists (if provided)
            if (input.listingId) {
                const listing = await ctx.db.listing.findUnique({
                    where: { id: input.listingId },
                });

                if (!listing) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Listing not found",
                    });
                }

                // Check if user already reported this listing
                const existingReport = await ctx.db.report.findUnique({
                    where: {
                        reporterId_listingId: {
                            reporterId: ctx.session.userId,
                            listingId: input.listingId,
                        },
                    },
                });

                if (existingReport) {
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: "You have already reported this listing",
                    });
                }
            }

            return await ctx.db.report.create({
                data: {
                    reporterId: ctx.session.userId,
                    reporteeId: input.reporteeId,
                    listingId: input.listingId ?? "",
                    reportType: input.reportType,
                    bodyText: input.bodyText,
                    reportStatus: [ReportStatus.OPEN],
                },
            });
        }),

    // 1b. Create a listing report (when listing ID is available)
    createListingReport: protectedProcedure
        .input(
            z.object({
                listingId: z.string(),
                reportType: z.array(z.nativeEnum(ReportTopic)),
                bodyText: z.string().min(1),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Get listing information to determine the seller/reportee
            const listing = await ctx.db.listing.findUnique({
                where: { id: input.listingId },
            });

            if (!listing) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Listing not found",
                });
            }

            // Ensure user isn't reporting their own listing
            if (listing.userId === ctx.session.userId) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "You cannot report your own listing",
                });
            }

            // Check if user already reported this listing
            const existingReport = await ctx.db.report.findUnique({
                where: {
                    reporterId_listingId: {
                        reporterId: ctx.session.userId,
                        listingId: input.listingId,
                    },
                },
            });

            if (existingReport) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "You have already reported this listing",
                });
            }

            return await ctx.db.report.create({
                data: {
                    reporterId: ctx.session.userId,
                    reporteeId: listing.userId, // The seller is the reportee
                    listingId: input.listingId,
                    reportType: input.reportType,
                    bodyText: input.bodyText,
                    reportStatus: [ReportStatus.OPEN],
                },
            });
        }),

    // 2. Get all reports (admin only, but implemented as protected for now)
    getAllReports: protectedProcedure.query(async ({ ctx }) => {
        const userRole = await ctx.db.user.findUnique({
            where: {
                id: ctx.session.userId
            },
            select: {
                isAdmin: true,
            }
        })

        if (!userRole?.isAdmin) {
            throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "User is not admin"
            })
        }

        return await ctx.db.report.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                reporter: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
                listing: {
                    select: {
                        id: true,
                        title: true,
                        imageUrls: true,
                    },
                },
            },
        });

    }),

    // 3. Get created reports by user ID (reports made by a user)
    getCreatedReports: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.db.report.findMany({
            where: { reporterId: ctx.session.userId },
            orderBy: { createdAt: "desc" },
            include: {
                listing: {
                    select: {
                        id: true,
                        title: true,
                        imageUrls: true,
                    },
                },
            },
        });
    }),

    // 4. Get received reports by user ID (reports about a user)
    getReceivedReports: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.db.report.findMany({
            where: { reporteeId: ctx.session.userId },
            orderBy: { createdAt: "desc" },
            include: {
                reporter: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                listing: {
                    select: {
                        id: true,
                        title: true,
                        imageUrls: true,
                    },
                },
            },
        });
    }),

    // 5. Close report (change status from OPEN to CLOSED)
    closeReport: protectedProcedure
        .input(z.string())
        .mutation(async ({ ctx, input }) => {
            const report = await ctx.db.report.findUnique({
                where: { id: input },
            });

            const userRole = await ctx.db.user.findUnique({
                where: {
                    id: ctx.session.userId,
                },
                select: {
                    isAdmin: true,
                }
            })

            if (!report) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Report not found",
                });
            }

            // Checks whether user is report creator or if user is admin
            if (report.reporterId !== ctx.session.userId || !userRole?.isAdmin) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You don't have permission to close this report",
                });
            }

            return await ctx.db.report.update({
                where: { id: input },
                data: {
                    reportStatus: [ReportStatus.CLOSED]
                },
            });
        }),

    // Bonus: Get all report topics for frontend
    getReportTopics: publicProcedure.query(() => {
        return Object.values(ReportTopic);
    }),

    // Check if a listing report already exists
    checkListingReportExists: publicProcedure
        .input(z.object({
            listingId: z.string(),
        }))
        .query(async ({ ctx, input }) => {
            const userId = ctx.session?.userId;
            if (!userId) return false;

            const existingReport = await ctx.db.report.findFirst({
                where: {
                    reporterId: userId,
                    listingId: input.listingId,
                }
            });

            return !!existingReport;
        }),
});