"use client";

import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import MaxWidthWrapper from "./_components/MaxWidthWrapper";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import Intro from "./_components/IntroPage";
import ListingGrid from "./_components/ListingGrid";

export default function Home() {
  const router = useRouter();
  const { data: listings, isLoading } = api.listings.getAllListings.useQuery();
  const { data: currentUser } = api.user.getCurrentUser.useQuery();

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

          {isLoading ? (
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
