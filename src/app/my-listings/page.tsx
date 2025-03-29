"use client";

import ListingCard from "../_components/ListingCard";
import UserProfileCard from "../_components/UserProfileCard";
import { api } from '~/trpc/react';

export default function ProfilePage() {
  const { data: user } = api.user.getCurrentUser.useQuery();
  const { data: listings } = api.user.getMyListings.useQuery(); //client component

  if (!listings || !user) return <div>User is not signed in!</div>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <UserProfileCard
          name={user.name}
          image={user.image}
          bio={user.bio}
          // totalListings={data.listings.length}
      />
      <h2 className="text-xl font-semibold mt-6 mb-2">Listings</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {listings.map((listing) => (
                <ListingCard key={listing.id} 
                title={listing.name} 
                price={listing.id}
                imageUrl={listing.image}
                condition={listing.bio}/>
            ))}
        </div>
    </div>
  )
  
};