"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Search, X } from "lucide-react";
import ChatWindow from "../../_components/ChatWindow";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { Status } from "@prisma/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

type SortOption = "recent" | "oldest";
type TimeFilter = "all" | "today" | "week" | "month";
type SortOrder = "newest" | "oldest";

export default function AdminConversationsPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [listingStatus, setListingStatus] = useState<Status | "ALL">("ALL");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({
    min: "",
    max: "",
  });
  const [priceSortOrder, setPriceSortOrder] = useState<"asc" | "desc" | null>(null);
  
  const { data: conversations, isLoading } = api.conversation.getAllConversations.useQuery();

  // Function to check if any filters are applied
  const hasActiveFilters = () => {
    return (
      listingStatus !== "ALL" ||
      timeFilter !== "all" ||
      sortOrder !== "newest" ||
      priceRange.min !== "" ||
      priceRange.max !== "" ||
      priceSortOrder !== null
    );
  };

  // Function to clear all filters
  const clearFilters = () => {
    setListingStatus("ALL");
    setTimeFilter("all");
    setSortOrder("newest");
    setPriceRange({ min: "", max: "" });
    setPriceSortOrder(null);
  };

  // Function to validate and update price range
  const handlePriceRangeChange = (type: "min" | "max", value: string) => {
    // Handle empty value
    if (value === "") {
      setPriceRange(prev => ({
        ...prev,
        [type]: ""
      }));
      return;
    }

    // Ensure value is a positive number
    const numValue = Number(value);
    if (isNaN(numValue) || numValue < 0) {
      return;
    }

    // Update the price range
    setPriceRange(prev => ({
      ...prev,
      [type]: value
    }));
  };

  // Filter conversations based on price
  const filteredConversations = conversations?.filter((conversation) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      conversation.buyer.name.toLowerCase().includes(searchLower) ||
      conversation.seller.name.toLowerCase().includes(searchLower) ||
      conversation.listing.title.toLowerCase().includes(searchLower);

    // Status filter
    const matchesStatus =
      listingStatus === "ALL" || conversation.listing.status === listingStatus;

    // Time filter
    const conversationDate = new Date(conversation.updatedAt);
    const now = new Date();
    let matchesTime = true;

    if (timeFilter !== "all") {
      const today = new Date(now.setHours(0, 0, 0, 0));
      
      if (timeFilter === "today") {
        matchesTime = conversationDate >= today;
      } else if (timeFilter === "week") {
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        matchesTime = conversationDate >= weekAgo;
      } else if (timeFilter === "month") {
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        matchesTime = conversationDate >= monthAgo;
      }
    }

    // Price filter
    const price = conversation.listing.price;
    const minPrice = priceRange.min ? Number(priceRange.min) : 0;
    const maxPrice = priceRange.max ? Number(priceRange.max) : Infinity;
    const matchesPrice = price >= minPrice && price <= maxPrice;

    return matchesSearch && matchesStatus && matchesTime && matchesPrice;
  });

  // Sort conversations
  const sortedConversations = filteredConversations?.sort((a, b) => {
    if (priceSortOrder) {
      return priceSortOrder === "asc" 
        ? a.listing.price - b.listing.price 
        : b.listing.price - a.listing.price;
    }
    
    const dateA = new Date(a.updatedAt).getTime();
    const dateB = new Date(b.updatedAt).getTime();
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  // Handle price range input key press
  const handlePriceKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const popoverTrigger = document.querySelector("[data-state='open']");
      if (popoverTrigger) {
        (popoverTrigger as HTMLButtonElement).click();
      }
    }
  };

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

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Select value={listingStatus} onValueChange={(value: Status | "ALL") => setListingStatus(value)}>
          <SelectTrigger className="h-8 rounded-full border border-input bg-white px-4 hover:bg-accent hover:text-accent-foreground">
            <SelectValue placeholder="All Conditions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Conditions</SelectItem>
            <SelectItem value="AVAILABLE">Available</SelectItem>
            <SelectItem value="RESERVED">Reserved</SelectItem>
            <SelectItem value="SOLD">Sold</SelectItem>
          </SelectContent>
        </Select>

        <Select value={timeFilter} onValueChange={(value: TimeFilter) => setTimeFilter(value)}>
          <SelectTrigger className="h-8 rounded-full border border-input bg-white px-4 hover:bg-accent hover:text-accent-foreground">
            <SelectValue placeholder="All Time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">Past Week</SelectItem>
            <SelectItem value="month">Past Month</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortOrder} onValueChange={(value: SortOrder) => setSortOrder(value)}>
          <SelectTrigger className="h-8 rounded-full border border-input bg-white px-4 hover:bg-accent hover:text-accent-foreground">
            <SelectValue placeholder="Newest First" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className={`h-8 rounded-full border border-input bg-white px-4 hover:bg-accent hover:text-accent-foreground font-normal text-sm ${
                priceRange.min || priceRange.max ? "w-[140px]" : ""
              }`}
            >
              {priceRange.min || priceRange.max ? (
                `Price: $${priceRange.min || '0'} - $${priceRange.max || '∞'}`
              ) : (
                "Price"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Price Range</h4>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="S$ Minimum"
                    value={priceRange.min}
                    onChange={(e) => handlePriceRangeChange("min", e.target.value)}
                    onKeyPress={handlePriceKeyPress}
                    className="h-8"
                    min="0"
                  />
                  <span>-</span>
                  <Input
                    type="number"
                    placeholder="S$ Maximum"
                    value={priceRange.max}
                    onChange={(e) => handlePriceRangeChange("max", e.target.value)}
                    onKeyPress={handlePriceKeyPress}
                    className="h-8"
                    min="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Sort by Price</h4>
                <Select 
                  value={priceSortOrder || "none"} 
                  onValueChange={(value: "asc" | "desc" | "none") => 
                    setPriceSortOrder(value === "none" ? null : value)
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Select order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No sorting</SelectItem>
                    <SelectItem value="asc">Low to High</SelectItem>
                    <SelectItem value="desc">High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  className="h-8"
                  onClick={() => {
                    setPriceRange({ min: "", max: "" });
                    setPriceSortOrder(null);
                  }}
                >
                  Clear
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {hasActiveFilters() && (
          <Button
            variant="ghost"
            className="h-8 rounded-full px-4 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={clearFilters}
          >
            Clear All Filters
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

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
            ) : sortedConversations && sortedConversations.length > 0 ? (
              sortedConversations.map((conversation) => (
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
            <ChatWindow conversationId={selectedConversationId} isAdminView={true} />
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