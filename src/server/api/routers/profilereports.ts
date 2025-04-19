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


    getAllProfileReports: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.db.profileReport.findMany({
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

            if (!report) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Report not found",
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