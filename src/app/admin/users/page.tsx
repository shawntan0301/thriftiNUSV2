import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card";
import MaxWidthWrapper from "../../_components/MaxWidthWrapper";
import { api } from "~/trpc/server";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UsersTable } from "./_components/UsersTable";

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