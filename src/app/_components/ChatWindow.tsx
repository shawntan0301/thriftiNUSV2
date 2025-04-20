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

  const { listing, buyer, seller } = conversation;
  let lastDateString = "";

  return (
    <div className="flex flex-col h-full bg-white">
      {/* sticky header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          {/* Buyer info */}
          <Link href={`/my-listings/view?id=${buyer.id}`} className="flex items-center gap-2">
            <img
              src={buyer.image || "/default-profile.jpg"}
              alt={buyer.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <span className="text-xs text-gray-500">Buyer</span>
              <p className="text-sm font-medium">{buyer.name}</p>
            </div>
          </Link>

          {/* Listing info */}
          <Link href={`/listing/view?id=${listing.id}`} className="flex items-center gap-3">
            <div className="flex flex-col text-right">
              <span className="text-sm font-semibold text-black truncate max-w-[200px]">
                {listing.title}
              </span>
              <span className="text-sm text-gray-600">
                S${listing.price.toFixed(2)}
              </span>
            </div>
            <div className="relative w-[50px] h-[50px] rounded-md overflow-hidden">
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

          {/* Seller info */}
          <Link href={`/my-listings/view?id=${seller.id}`} className="flex items-center gap-2">
            <div className="text-right">
              <span className="text-xs text-gray-500">Seller</span>
              <p className="text-sm font-medium">{seller.name}</p>
            </div>
            <img
              src={seller.image || "/default-profile.jpg"}
              alt={seller.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          </Link>
        </div>
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
                currentUserId={currentUser.id}
                buyerId={buyer.id}
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
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault(); // prevent newline
                if (newMessage.trim()) {
                  sendMessageMutation.mutate({ conversationId, content: newMessage });
                }
              }
            }}
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
