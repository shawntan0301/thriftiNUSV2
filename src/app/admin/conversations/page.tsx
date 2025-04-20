"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Search } from "lucide-react";
import ChatWindow from "../../_components/ChatWindow";

export default function AdminConversationsPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: conversations, isLoading } = api.conversation.getAllConversations.useQuery();

  // Filter conversations based on search query
  const filteredConversations = conversations?.filter((conversation) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      conversation.buyer.name.toLowerCase().includes(searchLower) ||
      conversation.seller.name.toLowerCase().includes(searchLower) ||
      conversation.listing.title.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Conversations</CardTitle>
          <p className="text-sm text-muted-foreground">
            Monitor all conversations between users
          </p>
        </CardHeader>
      </Card>

      <div className="flex rounded-lg overflow-hidden h-[calc(100vh-250px)]">
        {/* Conversations List */}
        <div className="w-[400px] bg-white border-r">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="overflow-y-auto h-[calc(100%-73px)]">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">Loading conversations...</div>
            ) : filteredConversations && filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversationId(conversation.id)}
                  className={`cursor-pointer border-b p-4 hover:bg-muted/50 ${
                    selectedConversationId === conversation.id ? "bg-muted" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={conversation.buyer.image || "/default-profile.jpg"}
                        alt={conversation.buyer.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="text-sm font-medium">{conversation.buyer.name}</span>
                      <span className="text-sm text-muted-foreground">→</span>
                      <img
                        src={conversation.seller.image || "/default-profile.jpg"}
                        alt={conversation.seller.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="text-sm font-medium">{conversation.seller.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <img
                      src={conversation.listing.imageUrls[0] || "/default-image.jpg"}
                      alt={conversation.listing.title}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium truncate">{conversation.listing.title}</p>
                      <p className="text-xs text-muted-foreground">
                        S${conversation.listing.price.toFixed(2)} • {conversation.listing.status}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                {searchQuery ? "No conversations found" : "No conversations yet"}
              </div>
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 bg-white">
          {selectedConversationId ? (
            <ChatWindow conversationId={selectedConversationId} />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a conversation to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 