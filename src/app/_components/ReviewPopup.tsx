"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { X } from "lucide-react";

type ReviewPopupProps = {
  targetUserId: string;
  onClose: () => void;
};

export default function ReviewPopup({ targetUserId, onClose }: ReviewPopupProps) {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { data: currentUser } = api.user.getCurrentUser.useQuery();
  const { data: targetUser } = api.user.getOtherUserById.useQuery({ id: targetUserId });
  const { data: existingReview } = api.review.getUserReview.useQuery({ userId: targetUserId });

  const createReview = api.review.createReview.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: (err) => alert("Failed to submit review: " + err.message),
  });

  const handleSubmit = () => {
    if (!rating || !content.trim()) {
      return alert("Please fill in all fields");
    }
    createReview.mutate({ targetUserId, rating, content });
  };

  const hasReviewed = existingReview?.some(r => r.authorId === currentUser?.id);

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/10 flex items-center justify-center">

      <div className="relative bg-white w-full max-w-md mx-auto rounded-lg shadow-lg p-6">
        <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700" onClick={onClose}>
          <X className="w-5 h-5" />
        </button>

        {submitted || hasReviewed ? (
          <div className="text-center">
            <h2 className="text-xl font-semibold text-green-500">Your review was successful!</h2>
            <p className="mt-2 text-gray-600">Thanks for reviewing {targetUser?.name}.</p>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-bold text-center mb-4">
              Write an honest review for <span className="text-blue-600">{targetUser?.name}!</span>
            </h2>

            {/* 5 stars -> change to yellow when clicked */}
            <div className="flex justify-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="text-3xl text-yellow-400 hover:scale-110 transition-transform cursor-pointer"
                >
                  {star <= rating ? "★" : <span className="text-gray-300">★</span>}
                </button>
              ))}
            </div>

            {/* text body */}
            <textarea
              rows={4}
              placeholder="Write your review here..."
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <button
              onClick={handleSubmit}
              className="mt-4 w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition cursor-pointer"
            >
              Submit Review
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
