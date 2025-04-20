import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { ReportStatus, ReportTopic } from "@prisma/client";

export const profileReportsRouter = createTRPCRouter({
    // Create a profile report
    createProfileReport: protectedProcedure
        .input(
            z.object({
                reporteeId: z.string(),
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

            // Check if user already reported this profile
            const existingReport = await ctx.db.profileReport.findFirst({
                where: {
                    reporterId: ctx.session.userId,
                    reporteeId: input.reporteeId,
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });


            if (existingReport && existingReport.reportStatus.includes(ReportStatus.OPEN)) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "You have already reported this user",
                });
            }

            return await ctx.db.profileReport.create({
                data: {
                    reporterId: ctx.session.userId,
                    reporteeId: input.reporteeId,
                    reportType: input.reportType,
                    bodyText: input.bodyText,
                    reportStatus: [ReportStatus.OPEN],
                },
            });
        }),

    // Get a specific profile report by ID
    getProfileReportById: protectedProcedure
        .input(z.string())
        .query(async ({ ctx, input }) => {
            const report = await ctx.db.profileReport.findUnique({
                where: { id: input },
                include: {
                    reporter: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                            email: true,
                            _count: {
                                select: {
                                    listing: true,
                                    receivedReviews: true,
                                }
                            },
                            receivedReviews: {
                                select: {
                                    rating: true,
                                }
                            }
                        },
                    },
                },
            });

            if (!report) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Report not found",
                });
            }

            // Get reportee details with additional information
            const reportee = await ctx.db.user.findUnique({
                where: { id: report.reporteeId },
                select: {
                    id: true,
                    name: true,
                    image: true,
                    email: true,
                    _count: {
                        select: {
                            listing: true,
                            receivedReviews: true,
                        }
                    },
                    receivedReviews: {
                        select: {
                            rating: true,
                        }
                    }
                },
            });

            // Calculate average ratings
            const reporterRating = report.reporter.receivedReviews.length > 0
                ? report.reporter.receivedReviews.reduce((sum, review) => sum + review.rating, 0) / report.reporter.receivedReviews.length
                : null;

            const reporteeRating = reportee?.receivedReviews.length ? 
                reportee.receivedReviews.reduce((sum, review) => sum + review.rating, 0) / reportee.receivedReviews.length
                : null;

            return {
                ...report,
                reporter: {
                    ...report.reporter,
                    rating: reporterRating,
                    listingsCount: report.reporter._count.listing,
                    reviewsCount: report.reporter._count.receivedReviews,
                },
                reportee: reportee ? {
                    ...reportee,
                    rating: reporteeRating,
                    listingsCount: reportee._count.listing,
                    reviewsCount: reportee._count.receivedReviews,
                } : null
            };
        }),

    getAllProfileReports: protectedProcedure.query(async ({ ctx }) => {
        const reports = await ctx.db.profileReport.findMany({
            include: {
                reporter: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Get reportee details for each report
        const reportsWithReportees = await Promise.all(
            reports.map(async (report) => {
                const reportee = await ctx.db.user.findUnique({
                    where: { id: report.reporteeId },
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        email: true,
                    },
                });

                return {
                    ...report,
                    reportee,
                };
            })
        );

        return reportsWithReportees;
    }),

    // Get reports created by the current user
    getCreatedProfileReports: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.db.profileReport.findMany({
            where: {
                reporterId: ctx.session.userId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }),

    // Get reports where the current user is being reported
    getReceivedProfileReports: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.db.profileReport.findMany({
            where: {
                reporteeId: ctx.session.userId,
            },
            include: {
                reporter: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }),

    // Close a report (change status from OPEN to CLOSED) 
    closeProfileReport: protectedProcedure
        .input(z.string())
        .mutation(async ({ ctx, input }) => {
            const report = await ctx.db.profileReport.findUnique({
                where: { id: input },
            });
            const userRole = await ctx.db.user.findUnique({
                where: {
                    id: ctx.session.userId,
                },
                select: {
                    isAdmin: true,
                }
            });

            if (!report) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Report not found",
                });
            }

            // Check if user is report creator or admin
            if (report.reporterId !== ctx.session.userId && !userRole?.isAdmin) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You don't have permission to close this report",
                });
            }

            return await ctx.db.profileReport.update({
                where: { id: input },
                data: {
                    reportStatus: [ReportStatus.CLOSED],
                },
            });
        }),

    // Check if current user has an OPEN report on a specific profile
    checkProfileReportExists: protectedProcedure
        .input(z.object({
            reporteeId: z.string(),
        }))
        .query(async ({ ctx, input }) => {
            // Find the most recent report between these users
            const report = await ctx.db.profileReport.findFirst({
                where: {
                    reporterId: ctx.session.userId,
                    reporteeId: input.reporteeId,
                },
                orderBy: {
                    createdAt: 'desc'  // Get the most recent report
                }
            });

            if (!report) return false;

            return report.reportStatus.includes(ReportStatus.OPEN);
        }),
});