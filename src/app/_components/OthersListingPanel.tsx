"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "~/trpc/react";
import type { User } from "@prisma/client";

interface OthersListingPanelProps {
  seller: User;
}

export default function OthersListingPanel({
  seller,
}: OthersListingPanelProps) {
  const [offer, setOffer] = useState<number>(12);
  const router = useRouter();
  const params = useSearchParams();
  const listingId = params.get("id");

  const getOrCreateMutation =
    api.conversation.getOrCreateConversation.useMutation({
      onSuccess: (conversation) => {
        router.push(`/conversation/view?id=${conversation.id}`);
      },
    });

  const handleChat = () => {
    if (!listingId) return alert("Listing ID not found");
    getOrCreateMutation.mutate({
      receiverId: seller.id,
      listingId: listingId,
    });
  };

  const handleMakeOffer = () => {
    alert(`You offered S$ ${offer}`);
  };

  return (
    <div className="flex max-w-sm flex-col gap-4">
      <button
        onClick={handleChat}
        className="rounded bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-600"
      >
        Chat with Seller
      </button>

      <div className="flex items-center overflow-hidden rounded border border-gray-300">
        <div className="flex items-center bg-white px-3">
          <span className="mr-1">$</span>
          <input
            type="number"
            min={0}
            value={offer}
            onChange={(e) => setOffer(e.target.valueAsNumber)}
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
      <button
        onClick={() => router.push(`/create-report/?listingId=${listingId}`)}
        className="rounded bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-600"
      >
        Report Listing
      </button>
    </div>
  );
}
