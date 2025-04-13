import React from "react";
import ListingCard from "./ListingCard";
import { Condition, Status } from "@prisma/client";
import Link from "next/link";

type Listing = {
  id: string;
  title: string;
  price: number;
  imageUrls: string[]; // ✅ updated from imageUrl to imageUrls
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
        {listings.map((listing) => (
          <Link key={listing.id} href={`/listing/view?id=${listing.id}`}>

            {/* ✅ pass only the first image to ListingCard */}
            <ListingCard
              id={listing.id}
              title={listing.title}
              price={listing.price}
              imageUrls={[listing.imageUrls[0] || "/default-image.jpg"]} // fallback image if empty
              condition={listing.condition}
              status={listing.status}
            />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ListingGrid;
