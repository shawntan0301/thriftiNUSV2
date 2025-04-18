"use client";

import { ReportTopic } from "@prisma/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { api } from "~/trpc/react";

export default function CreateFunction() {
    const router = useRouter();
    const params = useSearchParams();
    const listingId = params?.get("id");

    const [reportTopics, setReportTopics] = useState<ReportTopic[]>([]);
    const [reportBody, setReportBody] = useState("");

    const createReportMutation = api.report.createListingReport.useMutation();

    const handleTopicToggle = (topic: ReportTopic) => {
        setReportTopics((prev) =>
            prev.includes(topic)
                ? prev.filter((t) => t !== topic)
                : [...prev, topic]
        );
    };

    const handleSubmit = () => {
        if (reportTopics.length === 0 || !reportBody) {
            alert("Please fill in all the required fields")
            return
        }

        const payload = {
            listingId: listingId ?? "",
            reportType: reportTopics,
            bodyText: reportBody
        }

        createReportMutation.mutate(payload, {
            onSuccess: () => {
                router.push("/router/view")
            }
        })
    }


    return (
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
            <h2 className="text-2xl font-bold text-blue-900">Report details</h2>
            <div>
                <label className="font-semibold text-lg text-gray-900 mb-1 block">Category</label>
                <div className="flex gap-2 mt-2 flex-wrap">
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
                                className={`px-4 py-1 rounded-full shadow-sm transition ${selected
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
            <label className="font-semibold text-lg text-gray-900 mb-1 block">Report Description</label>
            <textarea
                value={reportBody}
                onChange={(e) => setReportBody(e.target.value)}
                placeholder="What is this issue?"
                className="w-full border p-2 rounded bg-white"
            />
            <button onClick={handleSubmit} className="bg-red-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-600">
                Create Report
            </button>
        </div>
    )
}