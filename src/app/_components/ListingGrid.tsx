import React from "react";
import ListingCard from "./ListingCard";
import { Condition } from "@prisma/client";

type Listing = {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  condition: Condition;
};

type ListingGridProps = {
  listings: Listing[];
};

const ListingGrid: React.FC<ListingGridProps> = ({ listings }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
      {listings.map((listing) => (
        <ListingCard key={listing.id} {...listing} />
      ))}
    </div>
  );
};

export default ListingGrid;
