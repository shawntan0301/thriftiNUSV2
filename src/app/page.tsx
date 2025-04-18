"use client";

import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import MaxWidthWrapper from "./_components/MaxWidthWrapper";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import Intro from "./_components/IntroPage";
import ListingGrid from "./_components/ListingGrid";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const { data: listings, isLoading } = api.listings.getAllListings.useQuery();
  const { data: currentUser } = api.user.getCurrentUser.useQuery();
  const [query, setQuery] = useState("");
  const { data: searchResults, refetch } = api.listings.searchListings.useQuery(
    { query },
    { enabled: false }
  );

  return (
    <div>
      <MaxWidthWrapper>
        <SignedIn>
          <Intro />

          <div className="flex justify-between items-center my-4">
            <button
              onClick={() => {
                if (currentUser?.id) {
                  router.push(`/my-listings/view?id=${currentUser.id}`);
                }
              }}
              className="px-4 py-2 rounded-md"
            >
              Check My Listings!
            </button>
          </div>

          {/* search bar + button */}
          <div className="mb-6 flex items-center gap-3">
            <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 5.65a7.5 7.5 0 010 10.6z"
                />
              </svg>
            </span>

              <input
                type="text"
                placeholder="Search listings..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") refetch();
                }}
                className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 text-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => refetch()}
              className="px-5 py-2 rounded-full bg-[#1F3B76] text-white font-semibold hover:bg-[#162b57] transition"
            >
              Search
            </button>
          </div>


          {/* Listing Results */}
          {searchResults && query.length > 0 ? (
          searchResults.length > 0 ? (
            <ListingGrid listings={searchResults} />
          ) : (
            <p>No results found.</p>
          )
        ) : isLoading ? (
          <p>Loading listings...</p>
        ) : listings && listings.length > 0 ? (
          <ListingGrid listings={listings} />
        ) : (
          <p>No listings available.</p>
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
