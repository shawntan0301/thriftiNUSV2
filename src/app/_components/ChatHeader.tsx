"use client";

import Link from "next/link";

type ChatHeaderProps = {
  otherUser: {
    id: string;
    name: string;
    image?: string | null;
  };
  listing: {
    id: string;
    title: string;
    price: number;
    imageUrls: string[];
    status: string;
  };
};

export default function ChatHeader({ otherUser, listing }: ChatHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center justify-between">
      {/* left: other user info */}
      <Link
        href={`/my-listings/view?id=${otherUser.id}`}
        className="flex items-center gap-3"
      >
        <img
          src={otherUser.image || "/default-profile.jpg"}
          alt={otherUser.name}
          className="w-11 h-11 rounded-full object-cover"
        />
        <span className="text-sm font-semibold text-black">
          {otherUser.name}
        </span>
      </Link>

      {/* right: listing info */}
      <Link
        href={`/listing/view?id=${listing.id}`}
        className="flex items-center gap-3"
      >
        <div className="flex flex-col text-right">
          <span className="text-sm font-semibold text-black">
            {listing.title}
          </span>
          <span className="text-sm text-gray-600">
            S$
            {Number.isInteger(listing.price)
              ? listing.price
              : parseFloat(listing.price.toFixed(2)).toFixed(
                  listing.price * 100 % 100 === 0
                    ? 0
                    : listing.price * 10 % 10 === 0
                    ? 2
                    : 2
                )}
          </span>
        </div>
        <div className="relative w-[60px] h-[60px] rounded-md overflow-hidden">
          <img
            src={listing.imageUrls[0]}
            alt={listing.title}
            className="object-cover w-full h-full"
          />
          {listing.status !== "AVAILABLE" && (
            <div
              className={`absolute bottom-0 left-0 w-full text-[10px] font-bold text-white text-center py-0.5 ${
                listing.status === "SOLD"
                  ? "bg-[#1F3B76]"
                  : "bg-[#F38325]"
              }`}
            >
              {listing.status}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
