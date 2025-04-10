"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import UserProfileCard from "../_components/UserProfileCard";
import ListingGrid from "../_components/ListingGrid";
import ReviewsGrid from "../_components/ReviewsGrid";

export default function ProfilePage() {
  const { data: user } = api.user.getCurrentUser.useQuery();
  const { data: listings } = api.user.getMyListings.useQuery();
  const { data: reviewsData } = api.user.getMyReviews.useQuery();

  const [activeTab, setActiveTab] = useState<"listings" | "reviews">("listings");

  const reviews = reviewsData?.reviews ?? [];
  const averageRating = reviewsData?.averageRating ?? 0;

  if (!user || !listings || !reviewsData) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <UserProfileCard
        name={user.name}
        image={user.image}
        bio={user.bio}
        totalListings={listings.length}
        averageRating={averageRating}
        totalReviews={reviews.length}
        joinedAt={new Date(user.createdAt)}
      />

      {/* Tab Navigation */}
      <div className="flex gap-6 border-b">
        <button
          onClick={() => setActiveTab("listings")}
          className={`pb-2 font-semibold ${
            activeTab === "listings"
              ? "text-blue-900 border-b-2 border-blue-900"
              : "text-gray-500"
          }`}
        >
          Listings
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={`pb-2 font-semibold ${
            activeTab === "reviews"
              ? "text-blue-900 border-b-2 border-blue-900"
              : "text-gray-500"
          }`}
        >
          Reviews
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "listings" && <ListingGrid listings={listings} />}
      {activeTab === "reviews" && (
        <ReviewsGrid reviews={reviews} averageRating={averageRating} />
      )}
    </div>
  );
}
