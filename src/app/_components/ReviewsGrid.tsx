"use client";

import React from "react";
import ReviewCard from "./ReviewCard";

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
};

const ReviewsGrid: React.FC<ReviewsGridProps> = ({ reviews }) => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-md w-full mt-4">
      <h2 className="text-lg font-semibold mb-3">Reviews</h2>
      <div className="flex flex-col gap-4">
        <div className="space-y-8">
          {reviews.map((review) => (
            <ReviewCard key={review.id} {...review} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewsGrid;
