"use client";

import { ReportTopic } from "@prisma/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { api } from "~/trpc/react";
import { ChevronDown, X } from "lucide-react";

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
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown when clicking outside
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

  const createReportMutation = api.report.createReport.useMutation();
  const createListingReportMutation =
    api.report.createListingReport.useMutation();

  const handleTopicToggle = (topic: ReportTopic) => {
    setReportTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
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
            toast.success("Report submitted successfully");
            // Invalidate the query cache so it refetches when we return to the listing page
            utils.report.checkListingReportExists.invalidate();
            // Add delay before navigation
            setTimeout(() => {
              router.back();
            }, 1500); // 1.5 second delay
          },
        }
      );
    } else {
      createListingReportMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Report submitted successfully");
          // Invalidate the query cache so it refetches when we return to the listing page
          utils.report.checkListingReportExists.invalidate({
            listingId: listingId ?? "",
          });
          // Add delay before navigation
          setTimeout(() => {
            router.back();
          }, 1500); // 1.5 second delay
        },
      });
    }
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
      <h2 className="text-2xl font-bold text-blue-900">Listing Report</h2>

      {/* dropdown multi-select */}
      <div>
        <label className="mb-1 block text-lg font-semibold text-gray-900">
          Reason for Report
        </label>

        {/* dropdown button */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center justify-between border border-gray-300 rounded-lg px-4 py-3 bg-white text-sm font-medium text-gray-700 shadow-sm hover:border-gray-400 transition"
          >
            {reportTopics.length > 0 ? "Select more reasons..." : "Select reasons"}
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

      {/* body text */}
      <label className="mb-1 block text-lg font-semibold text-gray-900">
        Report Description
      </label>
      <textarea
        value={reportBody}
        onChange={(e) => setReportBody(e.target.value)}
        placeholder="Please provide details about this listing report."
        className="w-full rounded-lg border border-gray-300 bg-white p-3 min-h-[140px] text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* submit button */}
      <button
        onClick={handleSubmit}
        className="rounded-full bg-red-500 px-6 py-3 font-semibold text-white hover:bg-red-600"
      >
        Submit Report
      </button>
    </div>
  );
}
