"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Star, Check, Search, Ban } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { UserActions } from "../UserActions";
import { useRouter } from "next/navigation";

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

export function UsersTable({ initialUsers, initialPage, initialSearch, totalPages }: UsersTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);

  const handleSearch = (value: string) => {
    setSearch(value);
    router.push(`?page=1&search=${encodeURIComponent(value)}`);
  };

  const handleStatusChange = () => {
    router.refresh();
  };

  return (
    <>
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <div className="grid grid-cols-12 border-b py-3 text-sm font-medium text-muted-foreground">
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {user.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <span>Account Age: {formatDistanceToNow(new Date(user.createdAt))}</span>
                      <span>|</span>
                      {user.averageRating && (
                        <>
                          <span>{user.averageRating.toFixed(1)}</span>
                          <Star className="h-3 w-3 fill-primary text-primary" />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-span-2 px-4">
                {user.banned ? (
                  <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
                    <Ban className="mr-1 h-3 w-3" />
                    Banned
                  </span>
                ) : user.isAdmin ? (
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-600">
                    <Check className="mr-1 h-3 w-3" />
                    Active
                  </span>
                )}
              </div>
              <div className="col-span-2 px-4 text-sm text-muted-foreground">
                {user.reviewCount} Reviews
              </div>
              <div className="col-span-3 flex items-center gap-2 px-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  asChild
                >
                  <a href={`/my-listings/view?id=${user.id}`}>View Profile</a>
                </Button>
                <UserActions 
                  userId={user.id} 
                  isBanned={user.banned || false}
                  onStatusChange={handleStatusChange} 
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 border-t p-4">
          <Button
            variant="outline"
            size="sm"
            disabled={initialPage === 1}
            asChild
          >
            <a href={`?page=${initialPage - 1}&search=${search}`}>Previous</a>
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={p === initialPage ? "default" : "outline"}
              size="sm"
              className={p === initialPage ? "" : ""}
              asChild
            >
              <a href={`?page=${p}&search=${search}`}>{p}</a>
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            disabled={initialPage === totalPages}
            asChild
          >
            <a href={`?page=${initialPage + 1}&search=${search}`}>Next</a>
          </Button>
        </div>
      </div>
    </>
  );
} 