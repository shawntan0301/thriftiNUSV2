"use client";

import React from "react";

type ChatMessageProps = {
  message: {
    id: string;
    content: string;
    sender: { id: string; name: string; image: string | null };
    createdAt: string | Date;
  };
  currentUserId: string;
  isAdminView?: boolean;
  buyerId?: string;
};

const formatTime = (date: Date | string) => {
  return new Date(date).toLocaleString("en-SG", {
    timeStyle: "short",
    hour12: true,
    timeZone: "Asia/Singapore",
  });
};

export default function ChatMessage({ message, currentUserId, isAdminView = false, buyerId }: ChatMessageProps) {
  const isMe = message.sender.id === currentUserId;
  const isBuyer = message.sender.id === buyerId;
  const formattedTime = formatTime(message.createdAt);

  // For admin view, align based on buyer/seller
  // For normal view, align based on current user
  const shouldAlignRight = isAdminView ? !isBuyer : isMe;

  return (
    <div className={`flex w-full mb-4 ${shouldAlignRight ? "justify-end" : "justify-start"}`}>
      <div className="flex flex-col max-w-[66%]">
        {/* Show sender info with role for admin view, or just sender info for normal view */}
        <div className={`flex items-center gap-2 mb-1 ${shouldAlignRight ? "justify-end" : "justify-start"}`}>
          {isAdminView ? (
            <>
              <div className="flex items-center gap-1">
                <img
                  src={message.sender.image || "/default-profile.jpg"}
                  alt={message.sender.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span className="text-xs text-gray-600">{message.sender.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                  {isBuyer ? "Buyer" : "Seller"}
                </span>
              </div>
            </>
          ) : (
            !isMe && (
              <>
                <img
                  src={message.sender.image || "/default-profile.jpg"}
                  alt={message.sender.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span className="text-xs text-gray-600">{message.sender.name}</span>
              </>
            )
          )}
        </div>
        <div
          className={`relative px-4 py-2 rounded-2xl text-sm shadow-sm break-words
            ${shouldAlignRight ? "bg-gray-200 text-black" : "bg-orange-100 text-black"}`}
        >
          <p>{message.content}</p>
          <span className="block text-right text-[10px] text-gray-500 mt-1">
            {formattedTime}
          </span>
        </div>
      </div>
    </div>
  );
}
