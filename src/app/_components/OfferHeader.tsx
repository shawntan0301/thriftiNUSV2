"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import ReviewPopup from "./ReviewPopup";

type OfferHeaderProps = {
  listingId: string;
  conversationBuyerId: string;
  currentUserId: string;
  sellerId: string;
  refetchConversation: () => void;
};

export default function OfferHeader({
  listingId,
  conversationBuyerId,
  currentUserId,
  sellerId,
  refetchConversation,
}: OfferHeaderProps) {
  const [showReviewPopup, setShowReviewPopup] = useState(false);

  const {
    data: latestOffer,
    refetch: refetchOffer,
    isLoading,
  } = api.offer.getLatestOfferForConversation.useQuery(
    { listingId, buyerId: conversationBuyerId },
    {
      enabled: !!listingId && !!conversationBuyerId,
      refetchInterval: 1000, // ← refresh every 1s like messages
    }
  );  

  const { data: currentUser } = api.user.getCurrentUser.useQuery();

  const isSeller = currentUserId === sellerId;
  const isBuyer = currentUserId === conversationBuyerId;

  const showReviewOption =
    latestOffer?.status === "ACCEPTED" &&
    ((isSeller && latestOffer?.buyerId === conversationBuyerId) ||
      (isBuyer && latestOffer?.buyerId === currentUserId));

  const reviewTargetId = isSeller ? latestOffer?.buyerId : sellerId;

  const { data: existingReviews } = api.review.getUserReview.useQuery(
    { userId: reviewTargetId ?? "" },
    { enabled: !!latestOffer && !!reviewTargetId }
  );

  const acceptMutation = api.offer.acceptOffer.useMutation({
    onSuccess: () => {
      refetchOffer().then(() => refetchConversation());
    },
  });

  const rejectMutation = api.offer.rejectOffer.useMutation({
    onSuccess: () => refetchOffer().then(refetchConversation),
  });

  if (isLoading || !latestOffer || !currentUser) return null;

  const hasReviewed = existingReviews?.some(
    (r) => r.authorId === currentUser.id
  );

  const statusLabelColors = {
    PENDING: "bg-yellow-200 text-yellow-900",
    ACCEPTED: "bg-green-200 text-green-900",
    REJECTED: "bg-gray-300 text-gray-800",
  };

  const amount = `S$ ${latestOffer.amount.toFixed(2)}`;

  return (
    <>
      <div className="sticky top-[66px] z-10 px-4 py-2 border-b bg-white">
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
            <div className="flex items-center gap-3">
              <div
                className={`text-xs px-3 py-1 rounded-full font-semibold ${statusLabelColors[latestOffer.status]}`}
              >
                {latestOffer.status}
              </div>

              {showReviewOption && reviewTargetId && (
                !hasReviewed ? (
                  <button
                    onClick={() => setShowReviewPopup(true)}
                    className="text-sm px-3 py-1 rounded bg-red-300 hover:bg-red-400"
                  >
                    Leave Review
                  </button>
                ) : (
                  <span className="text-xs text-gray-500 italic">
                    You’ve already reviewed this user.
                  </span>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {showReviewPopup && reviewTargetId && (
        <ReviewPopup
          targetUserId={reviewTargetId}
          onClose={() => setShowReviewPopup(false)}
        />
      )}
    </>
  );
}
