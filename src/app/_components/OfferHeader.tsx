"use client";

import { api } from "~/trpc/react";

type OfferHeaderProps = {
  listingId: string;
  currentUserId: string;
  sellerId: string;
  refetchConversation: () => void;
};

export default function OfferHeader({
  listingId,
  currentUserId,
  sellerId,
  refetchConversation,
}: OfferHeaderProps) {
  const {
    data: latestOffer,
    refetch: refetchOffer,
    isLoading,
  } = api.offer.getLatestOfferForConversation.useQuery(
    { listingId },
    { enabled: !!listingId }
  );

  const acceptMutation = api.offer.acceptOffer.useMutation({
    onSuccess: () => refetchOffer().then(refetchConversation),
  });
  const rejectMutation = api.offer.rejectOffer.useMutation({
    onSuccess: () => refetchOffer().then(refetchConversation),
  });

  if (isLoading || !latestOffer) return null;

  const isSeller = currentUserId === sellerId;
  const isBuyer = currentUserId === latestOffer.buyerId;

  const statusLabelColors = {
    PENDING: "bg-yellow-200 text-yellow-900",
    ACCEPTED: "bg-green-200 text-green-900",
    REJECTED: "bg-gray-300 text-gray-800",
  };

  const amount = `S$ ${latestOffer.amount.toFixed(2)}`;

  return (
    <div className={`sticky top-[66px] z-10 px-4 py-2 border-b bg-white`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-black">
          Offer:&nbsp;<span className="font-bold">{amount}</span>
        </span>

        {isSeller && latestOffer.status === "PENDING" ? (
          <div className="space-x-2">
            <button
              onClick={() => acceptMutation.mutate(latestOffer.id)}
              className="bg-green-600 text-white text-sm px-3 py-1 rounded hover:bg-green-700"
            >
              Accept
            </button>
            <button
              onClick={() => rejectMutation.mutate(latestOffer.id)}
              className="bg-gray-600 text-white text-sm px-3 py-1 rounded hover:bg-gray-700"
            >
              Reject
            </button>
          </div>
        ) : (
          <div
            className={`text-xs px-3 py-1 rounded-full font-semibold ${statusLabelColors[latestOffer.status]}`}
          >
            {latestOffer.status}
          </div>
        )}
      </div>
    </div>
  );
}
