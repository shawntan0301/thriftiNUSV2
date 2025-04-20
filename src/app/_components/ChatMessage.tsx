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
  buyerId: string;
};

const formatTime = (date: string | Date) => {
  return new Date(date).toLocaleString("en-SG", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZone: "Asia/Singapore",
  });
};

export default function ChatMessage({ message, currentUserId, buyerId }: ChatMessageProps) {
  const isBuyer = message.sender.id === buyerId;
  const formattedTime = formatTime(message.createdAt);

  return (
    <div className={`flex w-full ${isBuyer ? "justify-start" : "justify-end"} mb-4`}>
      {isBuyer && (
        <div className="flex flex-col items-center mr-2">
          <img
            src={message.sender.image || "/default-profile.jpg"}
            alt={message.sender.name}
            className="w-8 h-8 rounded-full object-cover mb-1"
          />
          <span className="text-xs text-gray-500">{message.sender.name}</span>
        </div>
      )}
      <div
        className={`relative max-w-[66%] px-4 py-2 rounded-2xl text-sm shadow-sm break-words
          ${isBuyer ? "bg-orange-100 text-black" : "bg-gray-200 text-black"}`}
      >
        <p>{message.content}</p>
        <span className="block text-right text-[10px] text-gray-500 mt-1">
          {formattedTime}
        </span>
      </div>
      {!isBuyer && (
        <div className="flex flex-col items-center ml-2">
          <img
            src={message.sender.image || "/default-profile.jpg"}
            alt={message.sender.name}
            className="w-8 h-8 rounded-full object-cover mb-1"
          />
          <span className="text-xs text-gray-500">{message.sender.name}</span>
        </div>
      )}
    </div>
  );
}
