"use client";

import { api } from "~/trpc/react";
import UserProfileCard from "../_components/UserProfileCard";
import ListingGrid from "../_components/ListingGrid";

export default function ProfilePage() {
  const { data: user } = api.user.getCurrentUser.useQuery();
  const { data: listings } = api.user.getMyListings.useQuery();

  if (!user || !listings) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <UserProfileCard
        name={user.name}
        image={user.image}
        bio={user.bio}
      />
      <ListingGrid listings={listings} />
    </div>
  );
}
