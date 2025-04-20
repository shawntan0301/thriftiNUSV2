"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import MyListingPanel from "../../_components/MyListingPanel";
import OthersListingPanel from "../../_components/OthersListingPanel";
import ListingDetails from "../../_components/ListingDetails";
import ImageDisplay from "../../_components/ImageDisplay";
import MeetTheSeller from "../../_components/MeetTheSeller";
import { motion } from "framer-motion";

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
    <motion.div
      className="max-w-6xl mx-auto px-4 py-6 space-y-6"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* listing images */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <ImageDisplay images={imageArray} />
      </motion.div>

      {/* layout for details and panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <motion.div
          className="md:col-span-2"
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <ListingDetails listing={listing} />
        </motion.div>

        <motion.div
          className="md:col-span-1"
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {isOwnListing ? (
            <MyListingPanel listingId={listing.id} status={listing.status} />
          ) : (
            <OthersListingPanel seller={listing.user} status={listing.status} />
          )}
        </motion.div>
      </div>

      {/* full-width meet the seller section */}
      <motion.div
        className="mt-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <MeetTheSeller sellerId={listing.userId} />
      </motion.div>
    </motion.div>
  );
}
