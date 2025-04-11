"use client";

import React from "react";
import ReviewCard from "./ReviewCard";
import { Star } from "lucide-react";

type Review = {
  id: string;
  content: string;
  rating: number;
  createdAt: Date;
  author: {
    id: string;
    name: string;
  };
};

type ReviewsGridProps = {
  reviews: Review[];
  averageRating: number | null;
};

const ReviewsGrid: React.FC<ReviewsGridProps> = ({ reviews, averageRating }) => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-md w-full mt-4">
      <h2 className="text-lg font-semibold mb-3 text-blue-900">Reviews</h2>

      {/* Average Rating */}
      <div className="mb-6">
        <div className="flex items-center text-3xl font-bold text-gray-900">
          {averageRating?.toFixed(1) ?? "0.0"}
          <Star size={28} className="ml-1 text-blue-900 fill-blue-900" />
        </div>
        <p className="text-sm text-gray-500">
          ({reviews.length} Review{reviews.length !== 1 ? "s" : ""})
        </p>
      </div>

      {/* Review List */}
      <div className="flex flex-col space-y-8">
        {reviews.map((review) => (
          <ReviewCard key={review.id} {...review} />
        ))}
      </div>
    </div>
  );
};

export default ReviewsGrid;
