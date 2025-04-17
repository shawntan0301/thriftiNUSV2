"use client";

import React from "react";
import { Status } from "@prisma/client";

type Props = {
  conversation: {
    id: string;
    updatedAt: string | Date;
    listing: {
      title: string;
      imageUrls: string[];
      status: Status;
    };
    buyer: { id: string; name: string; image: string | null };
    seller: { id: string; name: string; image: string | null };
    messages: {
      content: string;
      createdAt: string | Date;
    }[];
  };
  currentUserId: string;
  onClick: () => void;
};

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleString("en-SG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Singapore",
  });
};

export default function SingleConversationCard({
  conversation,
  currentUserId,
  onClick,
}: Props) {
  const otherUser =
    conversation.buyer.id === currentUserId
      ? conversation.seller
      : conversation.buyer;

  const latestMessage = conversation.messages[0];
  const snippet = latestMessage?.content || "No messages yet";
  const truncatedSnippet =
    snippet.length > 40 ? snippet.slice(0, 40).trim() + "..." : snippet;

  const { title, imageUrls, status } = conversation.listing;
  const listingImage = imageUrls?.[0] || "/default-image.jpg";
  const formattedDate = formatDate(latestMessage?.createdAt || conversation.updatedAt);

  return (
    <div
      onClick={onClick}
      className="cursor-pointer border-b last:border-none hover:bg-gray-50 transition px-4 py-4 flex items-center gap-3"
    >
      {/* pfp and name */}
      <img
        src={otherUser.image || "/default-profile.jpg"}
        alt={otherUser.name}
        className="w-13 h-13 rounded-full object-cover flex-shrink-0"
      />

      {/* title, latest msg */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-gray-800 truncate">
          {otherUser.name}
        </div>
        <div className="text-sm font-medium text-black truncate">{title}</div>
        <div className="text-xs text-gray-600 truncate">{truncatedSnippet}</div>
      </div>

      {/* date, time of latest msg, image */}
      <div className="flex flex-col items-end w-[110px] flex-shrink-0">
        
            <div className="text-xs text-gray-500 mb-1 whitespace-nowrap">{formattedDate}</div>

            <div className="relative w-[60px] h-[60px] rounded-md overflow-hidden">
              <img src={listingImage} alt={title} className="object-cover w-full h-full" />

          {status !== "AVAILABLE" && (
            <div
              className={`absolute bottom-0 left-0 w-full text-[10px] font-bold text-white text-center py-0.5 ${
                status === "SOLD" ? "bg-[#1F3B76]" : "bg-[#F38325]"
              }`}
            >
              {status}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
