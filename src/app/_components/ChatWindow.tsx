"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "~/trpc/react";
import ChatMessage from "./ChatMessage";
import Link from "next/link";
import OfferHeader from "./OfferHeader"; // Re-add this import

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleString("en-SG", {
    dateStyle: "medium",
    timeZone: "Asia/Singapore",
  });
};

type ChatWindowProps = {
  conversationId: string;
  isAdminView?: boolean;
};

export default function ChatWindow({ conversationId, isAdminView = false }: ChatWindowProps) {
  const { data: currentUser } = api.user.getCurrentUser.useQuery();
  const { data: conversation, isLoading, error, refetch } =
    api.conversation.getFullConversation.useQuery(
      { conversationId },
      {
        enabled: !!conversationId,
        refetchInterval: (data) => (document.hasFocus() ? 3000 : false), // refetch every 3 seconds only when window is focused
        refetchIntervalInBackground: false,
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

  const { listing, buyer, seller } = conversation;
  let lastDateString = "";

  // Helper function to get profile image URL
  const getProfileImage = (image: string | null) => image || "/default-profile.jpg";

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          {isAdminView ? (
            <>
              {/* Admin view header */}
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Buyer</span>
                  <div className="flex items-center gap-2">
                    <img
                      src={getProfileImage(buyer.image)}
                      alt={buyer.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <Link href={`/my-listings/view?id=${buyer.id}`} className="text-sm font-medium hover:underline">
                      {buyer.name}
                    </Link>
                  </div>
                </div>
              </div>

              <Link href={`/listing/view?id=${listing.id}`} className="flex items-center gap-3">
                <div className="flex flex-col text-center">
                  <span className="text-sm font-semibold text-black truncate max-w-[200px]">
                    {listing.title}
                  </span>
                  <span className="text-sm text-gray-600">
                    S${listing.price.toFixed(2)}
                  </span>
                </div>
                <div className="relative w-[50px] h-[50px] rounded-md overflow-hidden">
                  <img
                    src={listing.imageUrls[0] || "/default-image.jpg"}
                    alt={listing.title}
                    className="object-cover w-full h-full"
                  />
                  {listing.status !== "AVAILABLE" && (
                    <div
                      className={`absolute bottom-0 left-0 w-full text-[10px] font-bold text-white text-center py-0.5 ${listing.status === "SOLD" ? "bg-[#1F3B76]" : "bg-[#F38325]"
                        }`}
                    >
                      {listing.status}
                    </div>
                  )}
                </div>
              </Link>

              <div className="flex items-center gap-2">
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-500">Seller</span>
                  <div className="flex items-center gap-2">
                    <Link href={`/my-listings/view?id=${seller.id}`} className="text-sm font-medium hover:underline">
                      {seller.name}
                    </Link>
                    <img
                      src={getProfileImage(seller.image)}
                      alt={seller.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Normal user view header */}
              <div className="flex items-center gap-3">
                <img
                  src={getProfileImage(currentUser.id === buyer.id ? seller.image : buyer.image)}
                  alt={currentUser.id === buyer.id ? seller.name : buyer.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium">
                    {currentUser.id === buyer.id ? seller.name : buyer.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {listing.title} • S${listing.price.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="relative w-[40px] h-[40px] rounded-md overflow-hidden">
                <img
                  src={listing.imageUrls[0] || "/default-image.jpg"}
                  alt={listing.title}
                  className="object-cover w-full h-full"
                />
                {listing.status !== "AVAILABLE" && (
                  <div
                    className={`absolute bottom-0 left-0 w-full text-[10px] font-bold text-white text-center py-0.5 ${listing.status === "SOLD" ? "bg-[#1F3B76]" : "bg-[#F38325]"
                      }`}
                  >
                    {listing.status}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>


      {!isAdminView && (
        <OfferHeader
          listingId={listing.id}
          currentUserId={currentUser.id}
          sellerId={seller.id}
          conversationBuyerId={buyer.id}
          refetchConversation={refetch}
        />
      )}

      {/* Messages */}
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
                isAdminView={isAdminView}
                buyerId={buyer.id}
              />
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
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
