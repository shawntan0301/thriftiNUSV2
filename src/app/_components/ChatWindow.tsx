"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "~/trpc/react";
import ChatMessage from "./ChatMessage";
import Link from "next/link";

// format date to SGT
const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleString("en-SG", {
    dateStyle: "medium",
    timeZone: "Asia/Singapore",
  });
};

type ChatWindowProps = {
  conversationId: string;
};

export default function ChatWindow({ conversationId }: ChatWindowProps) {
  const { data: currentUser } = api.user.getCurrentUser.useQuery();
  const { data: conversation, isLoading, error, refetch } =
    api.conversation.getFullConversation.useQuery({ conversationId });

  const [newMessage, setNewMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const sendMessageMutation = api.conversation.sendMessage.useMutation({
    onSuccess: () => {
      setNewMessage("");
      setTimeout(() => {
        refetch().then(() => {
          bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        });
      }, 100);
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages.length]);

  if (isLoading || !currentUser) return <div>Loading conversation...</div>;
  if (error || !conversation) return <div>Error loading chat</div>;

  const currentUserId = currentUser.id;

  // the other user 
  const otherUser =
    conversation.buyer.id === currentUserId
      ? conversation.seller
      : conversation.buyer;

  const { listing } = conversation;
  let lastDateString = "";

  return (
    <div className="flex flex-col h-full bg-white">
      {/* sticky header */}
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
                    listing.price * 100 % 100 === 0 ? 0 :
                    listing.price * 10 % 10 === 0 ? 2 : 2
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
                  listing.status === "SOLD" ? "bg-[#1F3B76]" : "bg-[#F38325]"
                }`}
              >
                {listing.status}
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* chatMessage */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {conversation.messages.map((msg) => {
          const msgDate = formatDate(msg.createdAt);
          const showDate = msgDate !== lastDateString;
          lastDateString = msgDate;

          return (
            <div key={msg.id}>
              {showDate && (
                <div className="text-center text-xs text-gray-500 mb-2">
                  {msgDate}
                </div>
              )}
              <ChatMessage
                message={msg}
                currentUserId={currentUserId} // 👈 Ensures correct message alignment
              />
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* type */}
      <div className="border-t p-3 flex items-center bg-white">
        <div className="flex-1 bg-gray-100 text-sm text-black px-4 py-2 rounded-full">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type here..."
            className="w-full bg-transparent focus:outline-none placeholder-gray-500"
          />
        </div>
        <button
          onClick={() => {
            if (newMessage.trim()) {
              sendMessageMutation.mutate({ conversationId, content: newMessage });
            }
          }}
          className="ml-2 text-gray-500 hover:text-blue-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
