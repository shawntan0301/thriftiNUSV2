import React from "react";
import ListingCard from "./ListingCard";
import { Condition, Status } from "@prisma/client";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion"; // ← import

type Listing = {
  id: string;
  title: string;
  price: number;
  imageUrls: string[];
  condition: Condition;
  status: Status;
};

type ListingGridProps = {
  listings: Listing[];
};

const ListingGrid: React.FC<ListingGridProps> = ({ listings }) => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-md w-full mt-4">
      <h2 className="text-lg font-semibold mb-3">Listings</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        <AnimatePresence mode="popLayout">
          {listings.map((listing) => (
            <motion.div
              key={listing.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              {/* pass only the first image to ListingCard */}
              <Link href={`/listing/view?id=${listing.id}`}>
                <ListingCard
                  id={listing.id}
                  title={listing.title}
                  price={listing.price}
                  imageUrls={[listing.imageUrls[0] || "/default-image.jpg"]}
                  condition={listing.condition}
                  status={listing.status}
                />
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ListingGrid;
