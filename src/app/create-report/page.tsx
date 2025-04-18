"use client";

import { ReportTopic } from "@prisma/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import toast, { Toaster } from 'react-hot-toast';
import { api } from "~/trpc/react";

export default function CreateFunction() {
  const router = useRouter();
  const params = useSearchParams();
  const utils = api.useUtils();

  // if reporting a listing, add params behind listingId=...
  const listingId = params?.get("listingId");

  // if reporting a user, add params behind userId=...
  const targetUserId = params?.get("userId");

  const [reportTopics, setReportTopics] = useState<ReportTopic[]>([]);
  const [reportBody, setReportBody] = useState("");

  const createReportMutation = api.report.createReport.useMutation();
  const createListingReportMutation =
    api.report.createListingReport.useMutation();

  const handleTopicToggle = (topic: ReportTopic) => {
    setReportTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic],
    );
  };

  const handleSubmit = () => {
    if (reportTopics.length === 0 || !reportBody) {
      alert("Please fill in all the required fields");
      return;
    }

    const payload = {
      listingId: listingId ?? "",
      reportType: reportTopics,
      bodyText: reportBody,
    };

    if (targetUserId) {
      createReportMutation.mutate(
        { reporteeId: targetUserId, ...payload },
        {
          onSuccess: () => {
            toast.success('Report submitted successfully');
            // Invalidate the query cache so it refetches when we return to the listing page
            utils.report.checkListingReportExists.invalidate();
            // Add delay before navigation
            setTimeout(() => {
              router.back();
            }, 1500); // 1.5 second delay
          },
        },
      );
    } else {
      createListingReportMutation.mutate(payload, {
        onSuccess: () => {
          toast.success('Report submitted successfully');
          // Invalidate the query cache so it refetches when we return to the listing page
          utils.report.checkListingReportExists.invalidate({ listingId: listingId ?? "" });
          // Add delay before navigation
          setTimeout(() => {
            router.back();
          }, 1500); // 1.5 second delay
        },
      });
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
      <Toaster position="top-center" />
      <h2 className="text-2xl font-bold text-blue-900">Report details</h2>
      <div>
        <label className="mb-1 block text-lg font-semibold text-gray-900">
          Category
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
      <label className="mb-1 block text-lg font-semibold text-gray-900">
        Report Description
      </label>
      <textarea
        value={reportBody}
        onChange={(e) => setReportBody(e.target.value)}
        placeholder="What is this issue?"
        className="w-full rounded border bg-white p-2"
      />
      <button
        onClick={handleSubmit}
        className="rounded-full bg-red-500 px-6 py-3 font-semibold text-white hover:bg-red-600"
      >
        Create Report
      </button>
    </div>
  );
}
