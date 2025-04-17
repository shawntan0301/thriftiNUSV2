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
};

const formatTime = (date: Date | string) => {
  return new Date(date).toLocaleString("en-SG", {
    timeStyle: "short",
    hour12: true,
    timeZone: "Asia/Singapore",
  });
};

export default function ChatMessage({ message, currentUserId }: ChatMessageProps) {
  const isMe = message.sender.id === currentUserId;
  const formattedTime = formatTime(message.createdAt);

  return (
    <div className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`relative max-w-[66%] px-4 py-2 rounded-2xl text-sm shadow-sm break-words
          ${isMe ? "bg-gray-200 text-black" : "bg-orange-100 text-black"}`}
      >
        <p>{message.content}</p>
        <span className="block text-right text-[10px] text-gray-500 mt-1">
          {formattedTime}
        </span>
      </div>
    </div>
  );
}
