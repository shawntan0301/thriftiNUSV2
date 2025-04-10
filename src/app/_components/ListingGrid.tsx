import React from "react";
import ListingCard from "./ListingCard";
import { Condition, Status } from "@prisma/client";

type Listing = {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
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
          <ListingCard key={listing.id} {...listing} />
        ))}
      </div>
    </div>
  );
};

export default ListingGrid;
