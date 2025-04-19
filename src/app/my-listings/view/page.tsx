"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "~/trpc/react";
import UserProfileCard from "@/app/_components/UserProfileCard";
import ListingGrid from "@/app/_components/ListingGrid";
import ReviewsGrid from "@/app/_components/ReviewsGrid";

function OtherUserProfilePageContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");
  const [ready, setReady] = useState(false);
  const [activeTab, setActiveTab] = useState<"listings" | "reviews">("listings");

  const { data: currentUser } = api.user.getCurrentUser.useQuery();
  const { data: user } = api.user.getOtherUserById.useQuery(
    { id: userId ?? "" },
    { enabled: !!userId }
  );
  const { data: listings } = api.user.getOtherUserListings.useQuery(
    { userId: userId ?? "" },
    { enabled: !!userId }
  );
  const { data: reviews } = api.review.getUserReview.useQuery(
    { userId: userId ?? "" },
    { enabled: !!userId }
  );

  useEffect(() => {
    if (userId) setReady(true);
  }, [userId]);

  if (!userId || !user || !listings || !reviews || !currentUser || !ready) {
    return <div>Loading...</div>;
  }

  const isOwnProfile = currentUser.id === userId;

  const averageRating =
    reviews.length > 0
      ? parseFloat(
        (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      )
      : 0;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* User Info */}
      <UserProfileCard
        userId={user.id}
        name={user.name}
        image={user.image}
        bio={user.bio}
        totalListings={listings.length}
        averageRating={averageRating}
        totalReviews={reviews.length}
        joinedAt={new Date(user.createdAt)}
        isOwnProfile={isOwnProfile}
      />

      {/* Tab Navigation */}
      <div className="flex gap-6 border-b">
        <button
          onClick={() => setActiveTab("listings")}
          className={`pb-2 font-semibold ${activeTab === "listings"
              ? "text-blue-900 border-b-2 border-blue-900"
              : "text-gray-500"
            }`}
        >
          Listings
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={`pb-2 font-semibold ${activeTab === "reviews"
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

export default function OtherUserProfilePage() {
  return (
    <Suspense fallback={<div>Loading profile...</div>}>
      <OtherUserProfilePageContent />
    </Suspense>
  );
}
