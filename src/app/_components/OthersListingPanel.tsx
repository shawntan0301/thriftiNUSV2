"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "~/trpc/react";
import type { User, Status } from "@prisma/client";

interface OthersListingPanelProps {
  seller: User;
  status: Status; // NEW
}

export default function OthersListingPanel({
  seller,
  status,
}: OthersListingPanelProps) {
  const [offer, setOffer] = useState<number>(12);
  const router = useRouter();
  const params = useSearchParams();
  const listingId = params.get("id");

  // check if a report already exists
  const { data: reportExists, isLoading: checkingReport } =
    api.report.checkListingReportExists.useQuery(
      { listingId: listingId ?? "" },
      { enabled: !!listingId }
    );

  const createOfferMutation = api.offer.createOffer.useMutation();
  const getOrCreateMutation = api.conversation.getOrCreateConversation.useMutation();

  const handleChat = () => {
    if (!listingId) return alert("Listing ID not found");
    getOrCreateMutation.mutate(
      {
        receiverId: seller.id,
        listingId: listingId,
      },
      {
        onSuccess: (conversation) => {
          router.push(`/conversation/view?id=${conversation.id}`);
        },
        onError: () => {
          alert("Failed to start chat.");
        },
      }
    );
  };

  const handleMakeOffer = async () => {
    if (!listingId) return alert("Listing ID not found");

    try {
      // create the offer
      await createOfferMutation.mutateAsync({
        listingId,
        amount: offer,
      });

      // get or create the conversation
      const conversation = await getOrCreateMutation.mutateAsync({
        receiverId: seller.id,
        listingId,
      });

      // redirect to the conversation
      router.push(`/conversation/view?id=${conversation.id}`);
    } catch (err) {
      console.error("Failed to make offer:", err);
      alert("Something went wrong while making the offer.");
    }
  };

  const shouldShowOffer = status === "AVAILABLE" || status === "RESERVED";

  return (
    <div className="flex max-w-sm flex-col gap-4">
      {/* chat with seller */}
      <button
        onClick={handleChat}
        className="rounded bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-600"
      >
        Chat with Seller
      </button>

      {/* make offer, not shown if the listing status is sold */}
      {shouldShowOffer && (
        <div className="flex items-center overflow-hidden rounded border border-gray-300">
          <div className="flex items-center bg-white px-3">
            <span className="mr-1">$</span>
            <input
              type="number"
              min={0}
              value={isNaN(offer) ? "" : offer}
              onChange={(e) => {
                const val = e.target.valueAsNumber;
                setOffer(isNaN(val) ? 0 : val);
              }}
              className="w-16 text-center focus:outline-none"
            />
          </div>
          <button
            onClick={handleMakeOffer}
            className="flex-1 bg-gray-100 px-4 py-2 text-center text-sm font-semibold hover:bg-gray-200"
          >
            Make Offer
          </button>
        </div>
      )}

      {/* make a report, or already reported */}
      {reportExists ? (
        <button
          disabled
          className="rounded bg-gray-400 px-4 py-2 font-semibold text-white"
        >
          Report already created, pending review
        </button>
      ) : (
        <button
          onClick={() => router.push(`/create-report/?listingId=${listingId}`)}
          className="rounded bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-600"
        >
          Report Listing
        </button>
      )}
    </div>
  );
}
