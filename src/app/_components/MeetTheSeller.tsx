"use client";

import { api } from "~/trpc/react";
import ReviewsGrid from "./ReviewsGrid";
import Link from "next/link";

type Props = {
  sellerId: string;
};

export default function MeetTheSeller({ sellerId }: Props) {
  const { data: user } = api.user.getOtherUserById.useQuery({
    id: sellerId,
  });

  const { data: listings } = api.user.getOtherUserListings.useQuery({
    userId: sellerId,
  });

  const { data: reviewsData } = api.review.getUserReview.useQuery({
    userId: sellerId,
  });

  if (!user || !reviewsData || !listings) {
    return <div>Loading seller info...</div>;
  }

  const { reviews, averageRating } = {
    reviews: reviewsData,
    averageRating:
      reviewsData.length > 0
        ? parseFloat(
            (
              reviewsData.reduce((sum, r) => sum + r.rating, 0) /
              reviewsData.length
            ).toFixed(1)
          )
        : 0,
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-[#1F3B76]">Meet the seller</h2>

      {/* Seller Summary Card (Styled exactly like your screenshot) */}
      <Link
        href={`/my-listings/view?id=${user.id}`}
        className="flex items-center gap-4 bg-gray-100 p-4 rounded-xl shadow-sm hover:bg-gray-200 transition"
      >
        <img
          src={user.image ?? "/default-profile.jpg"}
          alt={user.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col text-sm text-gray-700">
          <span className="font-semibold text-black text-base">{user.name}</span>
          <span className="text-gray-500">{listings.length} Listings</span>
          <span className="text-gray-500">{user.bio ?? "No bio yet"}</span>
        </div>
      </Link>

      <ReviewsGrid reviews={reviews} averageRating={averageRating} />
    </div>
  );
}
