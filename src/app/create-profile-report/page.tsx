"use client";

import { ReportTopic } from "@prisma/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import toast, { Toaster } from 'react-hot-toast';
import { api } from "~/trpc/react";

export default function CreateProfileReport() {
    const router = useRouter();
    const params = useSearchParams();
    const utils = api.useUtils();

    // Get the user ID from the URL parameter
    const targetUserId = params?.get("userId");

    const [reportTopics, setReportTopics] = useState<ReportTopic[]>([]);
    const [reportBody, setReportBody] = useState("");

    // Use the profileReport router for user reporting
    const createProfileReportMutation = api.profileReport.createProfileReport.useMutation();

    const handleTopicToggle = (topic: ReportTopic) => {
        setReportTopics((prev) =>
            prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic],
        );
    };

    const handleSubmit = () => {
        if (!targetUserId) {
            toast.error("Missing user information");
            return;
        }

        if (reportTopics.length === 0 || !reportBody) {
            toast.error("Please fill in all the required fields");
            return;
        }

        createProfileReportMutation.mutate(
            {
                reporteeId: targetUserId,
                reportType: reportTopics,
                bodyText: reportBody,
            },
            {
                onSuccess: () => {
                    toast.success('User report submitted successfully');
                    // Invalidate the query cache
                    utils.profileReport.checkProfileReportExists.invalidate();
                    // Add delay before navigation
                    setTimeout(() => {
                        router.back();
                    }, 1500); // 1.5 second delay
                },
                onError: (error) => {
                    toast.error(error.message);
                }
            },
        );
    };

    return (
        <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
            <Toaster position="top-center" />
            <h2 className="text-2xl font-bold text-blue-900">Report User</h2>

            {!targetUserId ? (
                <div className="rounded-md bg-yellow-50 p-4 text-yellow-800">
                    No user specified. Please go back and try again.
                </div>
            ) : (
                <>
                    <div>
                        <label className="mb-1 block text-lg font-semibold text-gray-900">
                            Reason for Report
                        </label>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {Object.values(ReportTopic).map((topic) => {
                                const pretty = topic
                                    .toLowerCase()
                                    .split("_")
                                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                                    .join(" ");

                                const selected = reportTopics.includes(topic);

                                return (
                                    <button
                                        key={topic}
                                        type="button"
                                        onClick={() => handleTopicToggle(topic)}
                                        className={`rounded-full px-4 py-1 shadow-sm transition ${selected
                                                ? "bg-orange-500 text-white"
                                                : "bg-gray-200 text-gray-700"
                                            }`}
                                    >
                                        {pretty}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-lg font-semibold text-gray-900">
                            Report Description
                        </label>
                        <textarea
                            value={reportBody}
                            onChange={(e) => setReportBody(e.target.value)}
                            placeholder="Please provide details about this user report"
                            className="w-full rounded border bg-white p-2 min-h-[120px]"
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="rounded-full bg-red-500 px-6 py-3 font-semibold text-white hover:bg-red-600"
                    >
                        Submit User Report
                    </button>
                </>
            )}
        </div>
    );
}