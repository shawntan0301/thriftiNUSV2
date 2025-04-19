"use client";

import { api } from "~/trpc/react";
import MaxWidthWrapper from "../../_components/MaxWidthWrapper";
import ListingGrid from "../../_components/ListingGrid";

export default function AdminListingsPage() {
  const { data: allListings, isLoading } = api.listings.getAllListings.useQuery();

  return (
    <MaxWidthWrapper>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-800">All Listings</h1>
          <div className="text-sm text-slate-600">
            Total: {allListings?.length ?? 0} listings
          </div>
        </div>

        {/* listings */}
        {isLoading ? (
          <p className="text-center text-gray-600">Loading listings...</p>
        ) : allListings && allListings.length > 0 ? (
          <ListingGrid listings={allListings} />
        ) : (
          <p className="text-center text-gray-600">No listings found.</p>
        )}
      </div>
    </MaxWidthWrapper>
  );
} 