"use client";

import { useState } from "react";
import Link from "next/link";
import type { User } from "@prisma/client";

interface OthersListingPanelProps {
  seller: User;
}

export default function OthersListingPanel({ seller }: OthersListingPanelProps) {
  const [offer, setOffer] = useState<number>(12);

  const handleMakeOffer = () => {
    // You can replace this with an actual API call or other logic.
    alert(`You offered S$ ${offer}`);
  };

  return (
    <div className="flex flex-col gap-4 max-w-sm">
      {/* chat with seller */}
      <Link href={`/chat?sellerId=${seller.id}`}>
        <button className="px-4 py-2 bg-red-500 text-white font-semibold rounded hover:bg-red-600">
          Chat with Seller
        </button>
      </Link>

      {/* amount (need this to makr as sold, review) */}
      <div className="flex items-center border rounded overflow-hidden border-gray-300">
        <div className="flex items-center px-3 bg-white">
          <span className="mr-1">$</span>
          <input
            type="number"
            min={0}
            value={offer}
            onChange={(e) => setOffer(e.target.valueAsNumber)}
            className="w-16 focus:outline-none text-center"
          />
        </div>

        {/* make an offer */}
        <button
          onClick={handleMakeOffer}
          className="flex-1 text-center font-semibold text-sm px-4 py-2 bg-gray-100 hover:bg-gray-200"
        >
          Make Offer
        </button>
      </div>
    </div>
  );
}
