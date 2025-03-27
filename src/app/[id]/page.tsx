"use client";

import { api } from "~/trpc/react";
import { useParams } from "next/navigation";
import UserProfileCard from "../_components/UserProfileCard";
import ListingGrid from "../_components/ListingGrid";

const ProfilePage = () => {
  const params = useParams();
  const id = params.id as string;

  const { data: user, isLoading: loadingUser } =
    api.user.getOtherUserById.useQuery({ id });

  const { data: listings, isLoading: loadingListings } =
    api.user.getOtherUserListings.useQuery({ userId: id });

  if (loadingUser || loadingListings) return <div>Loading...</div>;
  if (!user || !listings) return <div>Not found</div>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <UserProfileCard
        name={user.name}
        image={user.image}
        bio={user.bio}
        totalListings={listings.length}
      />
      <h2 className="text-xl font-semibold mt-6 mb-2">Listings</h2>
      <ListingGrid
        listings={listings.map((listing) => ({
          id: listing.id,
          title: listing.title,
          price: listing.price,
          imageUrl: listing.imageUrl,
          condition: listing.description, // for now using description as condition
        }))}
      />
    </div>
  );
};

export default ProfilePage;