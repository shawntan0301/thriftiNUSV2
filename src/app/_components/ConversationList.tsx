"use client";

import React from "react";
import { api } from "~/trpc/react";
import SingleConversationCard from "./SingleConversationCard";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  onSelectConversation: (conversationId: string) => void;
  selectedId?: string;
};

export default function ConversationList({ onSelectConversation, selectedId }: Props) {
  const { data: conversations, isLoading, isError } =
    api.conversation.getConversationsForUser.useQuery(undefined, {
      refetchInterval: 5000,
    });

  const { data: currentUser } = api.user.getCurrentUser.useQuery();

  if (isLoading) return <div className="p-4 text-gray-500">Loading...</div>;
  if (isError || !conversations || !currentUser)
    return <div className="p-4 text-red-500">Failed to load conversations.</div>;

  const filteredAndSorted = [...conversations]
    .filter((c) => c.messages.length > 0 || c.listing?.offers?.length > 0)
    .sort((a, b) => {
      const latestA = a.messages[0]?.createdAt || a.listing.offers[0]?.createdAt || a.updatedAt;
      const latestB = b.messages[0]?.createdAt || b.listing.offers[0]?.createdAt || b.updatedAt;
      return new Date(latestB).getTime() - new Date(latestA).getTime();
    });

  return (
    <div className="overflow-y-auto h-full px-1">
      <AnimatePresence>
        {filteredAndSorted.map((conversation) => (
          <motion.div
            key={conversation.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <SingleConversationCard
              conversation={{
                ...conversation,
                offers: conversation.listing?.offers ?? [],
                listing: {
                  ...conversation.listing,
                  status: conversation.listing.status ?? "AVAILABLE",
                },
              }}
              currentUserId={currentUser.id}
              selected={selectedId === conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
            />

          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
