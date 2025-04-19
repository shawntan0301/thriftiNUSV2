"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import MyListingPanel from "../../_components/MyListingPanel";
import OthersListingPanel from "../../_components/OthersListingPanel";
import ListingDetails from "../../_components/ListingDetails";
import ImageDisplay from "../../_components/ImageDisplay";
import MeetTheSeller from "../../_components/MeetTheSeller";

export default function ListingViewPage() {
  const router = useRouter();
  const [listingId, setListingId] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    if (!id) {
      alert("No listing ID provided.");
      router.push("/");
    } else {
      setListingId(id);
    }
  }, [router]);

  const { data: listing, isLoading } = api.listings.getSingleListing.useQuery(
    { id: listingId ?? "" },
    { enabled: !!listingId }
  );

  const { data: currentUser } = api.user.getCurrentUser.useQuery();

  if (!listingId || isLoading || !listing || !currentUser) {
    return <div>Loading...</div>;
  }

  const isOwnListing = currentUser.id === listing.userId;
  const imageArray = Array.isArray(listing.imageUrls)
    ? listing.imageUrls
    : [listing.imageUrls];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Top image */}
      <ImageDisplay images={imageArray} />

      {/* Grid layout for details and panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2">
          <ListingDetails listing={listing} />
        </div>

        <div className="md:col-span-1">
          {isOwnListing ? (
            <MyListingPanel listingId={listing.id} status={listing.status} />
          ) : (
            <OthersListingPanel seller={listing.user} status={listing.status} />
          )}
        </div>
      </div>

      {/* Full-width seller section below the grid */}
      <div className="mt-12">
        <MeetTheSeller sellerId={listing.userId} />
      </div>
    </div>
  );
}
