"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "~/trpc/react";
import ChatMessage from "./ChatMessage";
import ChatHeader from "./ChatHeader";
import OfferHeader from "./OfferHeader";

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
  api.conversation.getFullConversation.useQuery(
    { conversationId },
    {
      enabled: !!conversationId,
      refetchInterval: 1000, // refetch every 3 seconds, dont need to refresh to see messages
    }
  );

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
  const isSeller = conversation.seller.id === currentUserId;

  const otherUser =
    conversation.buyer.id === currentUserId
      ? conversation.seller
      : conversation.buyer;

  const { listing } = conversation;
  let lastDateString = "";

  return (
    <div className="flex flex-col h-full bg-white">
      {/* TOP sticky HEADER user + listing info */}
      <ChatHeader otherUser={otherUser} listing={listing} />

      {/* SECOND sticky header for offer (if exists) */}
      <OfferHeader
        listingId={listing.id}
        currentUserId={currentUserId}
        sellerId={conversation.seller.id}
        refetchConversation={refetch}
      />

      {/* chat messages */}
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
                currentUserId={currentUserId}
              />
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* chat input box */}
      <div className="border-t p-3 flex items-center bg-white">
        <div className="flex-1 bg-gray-100 text-sm text-black px-4 py-2 rounded-full">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (newMessage.trim()) {
                  sendMessageMutation.mutate({
                    conversationId,
                    content: newMessage,
                  });
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
              sendMessageMutation.mutate({
                conversationId,
                content: newMessage,
              });
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
