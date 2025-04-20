import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card";
import MaxWidthWrapper from "../../_components/MaxWidthWrapper";
import { api } from "~/trpc/server";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UsersTable } from "./_components/UsersTable";

type SearchParams = {
  page?: string;
  search?: string;
  status?: string;
  reviews?: string;
  age?: string;
  rating?: string;
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
  const statusFilter = params.status || "all";
  const reviewsFilter = params.reviews || "all";
  const accountAgeFilter = params.age || "all";
  const ratingFilter = params.rating || "all";
  
  const { users, total, pages } = await api.admin.getUsers({
    page,
    limit: 10,
    search,
    statusFilter: statusFilter as "all" | "active" | "admin" | "banned",
    reviewsFilter: reviewsFilter as "all" | "0" | "1-5" | "6-10" | "10+",
    accountAgeFilter: accountAgeFilter as "all" | "today" | "week" | "month" | "year",
    ratingFilter: ratingFilter as "all" | "5" | "4" | "3" | "2" | "1",
  });

  return (
    <MaxWidthWrapper>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-[oklch(0.428_0.11_266.57)]">Users</CardTitle>
            <CardDescription>
              Manage user accounts and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UsersTable 
              initialUsers={users} 
              initialPage={page} 
              initialSearch={search} 
              totalPages={pages}
            />
          </CardContent>
        </Card>
      </div>
    </MaxWidthWrapper>
  );
}