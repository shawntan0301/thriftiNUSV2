"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Star, Search, Ban, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { UserActions } from "../UserActions";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: Date;
  isAdmin: boolean;
  reviewCount: number;
  averageRating: number | null;
  banned?: boolean;
}

interface UsersTableProps {
  initialUsers: User[];
  initialPage: number;
  initialSearch: string;
  totalPages: number;
}

export function UsersTable({
  initialUsers,
  initialPage,
  initialSearch,
  totalPages,
}: UsersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "all",
  );
  const [reviewsFilter, setReviewsFilter] = useState(
    searchParams.get("reviews") || "all",
  );
  const [accountAgeFilter, setAccountAgeFilter] = useState(
    searchParams.get("age") || "all",
  );
  const [ratingFilter, setRatingFilter] = useState(
    searchParams.get("rating") || "all",
  );

  // Check if any filters are active
  const hasActiveFilters =
    statusFilter !== "all" ||
    reviewsFilter !== "all" ||
    accountAgeFilter !== "all" ||
    ratingFilter !== "all" ||
    search !== "";

  // Update URL when filters change
  const updateURL = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === "all" || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    router.push(`?${params.toString()}`);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setStatusFilter("all");
    setReviewsFilter("all");
    setAccountAgeFilter("all");
    setRatingFilter("all");
    setSearch("");
    router.push("?");
  };

  // Debounce search updates
  useEffect(() => {
    const timer = setTimeout(() => {
      updateURL({ search });
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    updateURL({ status: value });
  };

  const handleReviewsChange = (value: string) => {
    setReviewsFilter(value);
    updateURL({ reviews: value });
  };

  const handleAgeChange = (value: string) => {
    setAccountAgeFilter(value);
    updateURL({ age: value });
  };

  const handleRatingChange = (value: string) => {
    setRatingFilter(value);
    updateURL({ rating: value });
  };

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <>
      <div className="space-y-4">
        <div className="relative mb-4">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="border-input hover:bg-accent hover:text-accent-foreground h-8 rounded-full border bg-white px-4">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
            </SelectContent>
          </Select>

          <Select value={reviewsFilter} onValueChange={handleReviewsChange}>
            <SelectTrigger className="border-input hover:bg-accent hover:text-accent-foreground h-8 rounded-full border bg-white px-4">
              <SelectValue placeholder="Reviews" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reviews</SelectItem>
              <SelectItem value="0">No Reviews</SelectItem>
              <SelectItem value="1-5">1-5 Reviews</SelectItem>
              <SelectItem value="6-10">6-10 Reviews</SelectItem>
              <SelectItem value="10+">10+ Reviews</SelectItem>
            </SelectContent>
          </Select>

          <Select value={accountAgeFilter} onValueChange={handleAgeChange}>
            <SelectTrigger className="border-input hover:bg-accent hover:text-accent-foreground h-8 rounded-full border bg-white px-4">
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={ratingFilter} onValueChange={handleRatingChange}>
            <SelectTrigger className="border-input hover:bg-accent hover:text-accent-foreground h-8 rounded-full border bg-white px-4">
              <SelectValue placeholder="Star Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4+ Stars</SelectItem>
              <SelectItem value="3">3+ Stars</SelectItem>
              <SelectItem value="2">2+ Stars</SelectItem>
              <SelectItem value="1">1+ Star</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              className="text-muted-foreground hover:bg-accent hover:text-accent-foreground h-8 rounded-full px-4"
              onClick={clearAllFilters}
            >
              Clear All Filters
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-md border">
        <div className="text-muted-foreground grid grid-cols-12 border-b py-3 text-sm font-medium">
          <div className="col-span-5 px-4">Account</div>
          <div className="col-span-2 px-4">Status</div>
          <div className="col-span-2 px-4">Reviews</div>
          <div className="col-span-3 px-4">Actions</div>
        </div>

        <div className="divide-y">
          {initialUsers.map((user) => (
            <div key={user.id} className="grid grid-cols-12 items-center py-3">
              <div className="col-span-5 px-4">
                <div className="flex items-center gap-3">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
                      {user.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-muted-foreground flex items-center gap-1 text-sm">
                      <span>
                        Account Age:{" "}
                        {formatDistanceToNow(new Date(user.createdAt))}
                      </span>
                      <span>|</span>
                      {user.averageRating && (
                        <>
                          <span>{user.averageRating.toFixed(1)}</span>
                          <Star className="fill-primary text-primary h-3 w-3" />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-span-2 px-4">
                {user.banned ? (
                  <span className="bg-destructive/10 text-destructive inline-flex items-center rounded-full px-2 py-1 text-xs font-medium">
                    <Ban className="mr-1 h-3 w-3" />
                    Banned
                  </span>
                ) : user.isAdmin ? (
                  <span className="bg-primary/10 text-primary inline-flex items-center rounded-full px-2 py-1 text-xs font-medium">
                    Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-600">
                    Active
                  </span>
                )}
              </div>
              <div className="text-muted-foreground col-span-2 px-4 text-sm">
                {user.reviewCount} Reviews
              </div>
              <div className="col-span-3 flex items-center gap-2 px-4">
                <Button variant="outline" size="sm" className="h-8" asChild>
                  <a href={`/my-listings/view?id=${user.id}`}>View Profile</a>
                </Button>
                <UserActions
                  userId={user.id}
                  isBanned={user.banned || false}
                  isAdmin={user.isAdmin}
                  onStatusChange={handleRefresh}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
