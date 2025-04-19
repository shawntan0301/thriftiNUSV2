"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "~/trpc/react";
import UserProfileCard from "@/app/_components/UserProfileCard";
import ListingGrid from "@/app/_components/ListingGrid";
import ReviewsGrid from "@/app/_components/ReviewsGrid";
import { motion, AnimatePresence } from "framer-motion";

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
    <motion.div
      className="max-w-6xl mx-auto p-4 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
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
      <div className="flex gap-6 border-b relative">
        {["listings", "reviews"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as "listings" | "reviews")}
            className={`pb-2 font-semibold transition-colors ${
              activeTab === tab ? "text-blue-900" : "text-gray-500"
            }`}
          >
            {(tab[0] ?? "").toUpperCase() + tab.slice(1)}
            {activeTab === tab && (
              <motion.div
                layoutId="underline"
                className="h-0.5 bg-blue-900 mt-2 rounded"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content with animation */}
      <AnimatePresence mode="wait">
        {activeTab === "listings" && (
          <motion.div
            key="listings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <ListingGrid listings={listings} />
          </motion.div>
        )}
        {activeTab === "reviews" && (
          <motion.div
            key="reviews"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <ReviewsGrid reviews={reviews} averageRating={averageRating} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function OtherUserProfilePage() {
  return (
    <Suspense fallback={<div>Loading profile...</div>}>
      <OtherUserProfilePageContent />
    </Suspense>
  );
}
