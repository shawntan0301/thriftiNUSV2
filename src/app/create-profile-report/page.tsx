"use client";

import { ReportTopic } from "@prisma/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import toast, { Toaster } from 'react-hot-toast';
import { api } from "~/trpc/react";
import { ChevronDown, X } from "lucide-react";

export default function CreateProfileReport() {
    const router = useRouter();
    const params = useSearchParams();
    const utils = api.useUtils();

    // Get the user ID from the URL parameter
    const targetUserId = params?.get("userId");

    const [reportTopics, setReportTopics] = useState<ReportTopic[]>([]);
    const [reportBody, setReportBody] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const dropdownRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setDropdownOpen(false);
            }
        };
    
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

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

    const prettyLabel = (topic: ReportTopic) =>
        topic
            .toLowerCase()
            .split("_")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");

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
                    {/* reason for report */}
                    <div>
                        <label className="mb-1 block text-lg font-semibold text-gray-900">
                            Reason for Report
                        </label>

                        {/* dropdown button */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center justify-between w-full border rounded-md px-4 py-2 bg-white shadow-sm text-sm font-medium text-gray-700 hover:border-gray-400"
                            >
                                {reportTopics.length > 0
                                    ? "Select more reasons..."
                                    : "Select reasons"}
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </button>

                            {/* dropdown list */}
                            {dropdownOpen && (
                                <div className="absolute z-10 mt-2 w-full rounded-md bg-white shadow-lg border max-h-64 overflow-y-auto">
                                    {Object.values(ReportTopic).map((topic) => (
                                        <div
                                            key={topic}
                                            onClick={() => handleTopicToggle(topic)}
                                            className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                                                reportTopics.includes(topic)
                                                    ? "bg-orange-100 text-orange-700 font-semibold"
                                                    : "text-gray-700"
                                            }`}
                                        >
                                            {prettyLabel(topic)}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* selected topics */}
                        <div className="mt-3 flex flex-wrap gap-2">
                            {reportTopics.map((topic) => (
                                <div
                                    key={topic}
                                    className="flex items-center gap-1 bg-orange-500 text-white px-3 py-1 rounded-full text-sm"
                                >
                                    {prettyLabel(topic)}
                                    <button
                                        onClick={() => handleTopicToggle(topic)}
                                        className="ml-1 hover:text-gray-200"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* text body */}
                    <div>
                        <label className="mb-1 block text-lg font-semibold text-gray-900">
                            Report Description
                        </label>
                        <textarea
                            value={reportBody}
                            onChange={(e) => setReportBody(e.target.value)}
                            placeholder="Please provide details about this user report."
                            className="w-full rounded border bg-white p-2 min-h-[120px]"
                        />
                    </div>

                    {/* submit button */}
                    <button
                        onClick={handleSubmit}
                        className="rounded-full bg-red-500 px-6 py-3 font-semibold text-white hover:bg-red-600"
                    >
                        Submit Report
                    </button>
                </>
            )}
        </div>
    );
}
