import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  MessageSquare,
  AlertTriangle,
  LogOut,
  Search,
  Bell,
  Gauge,
  ChevronRight,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Input } from "~/components/ui/input";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userId = session.userId;

  if (!userId) {
    redirect("/sign-in");
  }

  const dbUser = await db.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true, name: true, image: true },
  });

  if (!dbUser?.isAdmin) {
    redirect("/");
  }

  return (
    <div className="flex h-screen bg-muted/40">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 z-20 hidden w-64 flex-col border-r bg-background md:flex">
        <div className="border-b px-6 py-4">
          <Link href="/admin" className="flex items-center gap-2">
            <Gauge className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">ThriftiNUS Admin</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-auto py-4">
          <div className="px-4">
            <h2 className="mb-2 text-xs font-semibold text-muted-foreground">
              OVERVIEW
            </h2>
            <div className="space-y-1">
              <Link
                href="/admin"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/admin/users"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                <Users className="h-4 w-4" />
                Users
              </Link>
              <Link
                href="/admin/listings"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                <ShoppingBag className="h-4 w-4" />
                Listings
              </Link>
              <Link
                href="/admin/conversations"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                <MessageSquare className="h-4 w-4" />
                Conversations
              </Link>
              <Link
                href="/admin/reports"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                <AlertTriangle className="h-4 w-4" />
                Reports
              </Link>
            </div>
          </div>
        </nav>
        <div className="mt-auto border-t p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserButton afterSignOutUrl="/" />
              <div className="text-sm">
                <p className="text-xs text-muted-foreground">Admin</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="ghost" size="icon">
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Exit Admin</span>
              </Button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Trigger */}
      <div className="fixed inset-x-0 top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 md:hidden">
        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
          <Gauge className="h-4 w-4" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
        <div className="flex items-center gap-4">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-16 md:ml-64 md:pt-0">
        {/* <div className="h-[64px] border-b md:flex md:items-center md:justify-between md:px-6 md:py-4">
          <div className="hidden items-center gap-2 md:flex">
            <div className="flex items-center gap-1 text-sm font-medium">
              <Link href="/admin" className="text-muted-foreground hover:text-foreground">
                Admin
              </Link>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span>Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-4 px-4 md:px-0">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
          </div>
        </div> */}
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
} 