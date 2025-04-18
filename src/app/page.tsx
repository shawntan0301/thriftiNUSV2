"use client";

import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import MaxWidthWrapper from "./_components/MaxWidthWrapper";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import Intro from "./_components/IntroPage";
import ListingGrid from "./_components/ListingGrid";
import SearchAndFilters from "./_components/SearchAndFilters";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const { data: currentUser } = api.user.getCurrentUser.useQuery();
  const { data: allListings, isLoading } = api.listings.getAllListings.useQuery();
  const [listings, setListings] = useState<any[] | null>(null);

  const listingsToShow = listings ?? allListings;

  return (
    <div>
      <MaxWidthWrapper>
        <SignedIn>
          <Intro />

          {/* search, filters */}
          <SearchAndFilters onUpdateResults={setListings} />

          {/* listings */}
          {isLoading ? (
            <p>Loading listings...</p>
          ) : listingsToShow && listingsToShow.length > 0 ? (
            <ListingGrid listings={listingsToShow} />
          ) : (
            <p className="text-gray-600">No results found.</p>
          )}
        </SignedIn>

        <SignedOut>
          <Intro />
          <p className="text-center text-gray-600 mt-4">
            Please sign in to explore the marketplace.
          </p>
        </SignedOut>
      </MaxWidthWrapper>
    </div>
  );
}
