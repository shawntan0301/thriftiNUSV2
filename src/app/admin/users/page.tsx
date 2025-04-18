import { Button } from "~/components/ui/button";
import { Star, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { UserActions } from "./UserActions";
import SearchBar from "./SearchBar";
import { api } from "~/trpc/server";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export const metadata: Metadata = {
  title: "Manage Users - Admin",
  description: "Manage users in the ThriftiNUS platform",
};

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: Date;
  isAdmin: boolean;
  reviewCount: number;
  averageRating: number | null;
}

type SearchParams = {
  page?: string;
  search?: string;
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || "";
  
  const { users, total, pages } = await api.admin.getUsers({
    page,
    limit: 10,
    search,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
      </div>

      <div className="mb-4 w-full md:max-w-xs">
        <SearchBar defaultValue={search} />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-12 border-b py-3 text-sm font-medium text-muted-foreground">
              <div className="col-span-5 px-4">Account</div>
              <div className="col-span-2 px-4">Status</div>
              <div className="col-span-2 px-4">Reviews</div>
              <div className="col-span-3 px-4">Actions</div>
            </div>

            <div className="divide-y">
              {users.map((user: User) => (
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
                          <span>Account Age: {formatDistanceToNow(user.createdAt)}</span>
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
                    {user.isAdmin ? (
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
                    <UserActions />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 border-t p-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                asChild
              >
                <a href={`?page=${page - 1}&search=${search}`}>Previous</a>
              </Button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={p === page ? "default" : "outline"}
                  size="sm"
                  className={p === page ? "" : ""}
                  asChild
                >
                  <a href={`?page=${p}&search=${search}`}>{p}</a>
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                disabled={page === pages}
                asChild
              >
                <a href={`?page=${page + 1}&search=${search}`}>Next</a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}