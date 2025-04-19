"use client";

import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import MaxWidthWrapper from "./_components/MaxWidthWrapper";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import Intro from "./_components/IntroPage";
import ListingGrid from "./_components/ListingGrid";
import SearchAndFilters from "./_components/SearchAndFilters";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Intro />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <SearchAndFilters onUpdateResults={setListings} />
          </motion.div>

          <AnimatePresence>
            {isLoading ? (
              <motion.p
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                Loading listings...
              </motion.p>
            ) : listingsToShow && listingsToShow.length > 0 ? (
              <motion.div
                key="listings"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ListingGrid listings={listingsToShow} />
              </motion.div>
            ) : (
              <motion.p
                key="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-gray-600 text-center"
              >
                No results found.
              </motion.p>
            )}
          </AnimatePresence>
        </SignedIn>

        <SignedOut>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Intro />
            <p className="text-center text-gray-600 mt-4">
              Please sign in to explore the marketplace.
            </p>
          </motion.div>
        </SignedOut>
      </MaxWidthWrapper>
    </div>
  );
}
