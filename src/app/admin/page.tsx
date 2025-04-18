import { api } from "~/trpc/server";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Users, ShoppingBag, MessageSquare, AlertTriangle } from "lucide-react";
import type { Category, Condition, Status, ReportStatus } from "@prisma/client";

interface AnalyticsData {
  totalUsers: number;
  totalListings: number;
  totalConversations: number;
  totalReports: number;
  listingsByCategory: Array<{ category: Category; _count: number }>;
  listingsByCondition: Array<{ condition: Condition; _count: number }>;
  listingsByStatus: Array<{ status: Status; _count: number }>;
  reportsByStatus: Array<{ reportStatus: ReportStatus; _count: number }>;
}

export default async function AdminPage() {
  const analytics = await api.admin.getAnalytics();

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Users</CardTitle>
            <div className="rounded-full bg-blue-50 p-2">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsers}</div>
            <p className="text-xs text-slate-500">Registered users</p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Listings</CardTitle>
            <div className="rounded-full bg-green-50 p-2">
              <ShoppingBag className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalListings}</div>
            <p className="text-xs text-slate-500">Active and sold listings</p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Conversations</CardTitle>
            <div className="rounded-full bg-purple-50 p-2">
              <MessageSquare className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalConversations}</div>
            <p className="text-xs text-slate-500">Between users</p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Reports</CardTitle>
            <div className="rounded-full bg-red-50 p-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalReports}</div>
            <p className="text-xs text-slate-500">Filed by users</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-slate-800">Listings by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.listingsByCategory.map((item) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-slate-600">{item.category.toLowerCase()}</span>
                  </div>
                  <span className="font-medium text-slate-900">{item._count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-slate-800">Listings by Condition</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.listingsByCondition.map((item) => (
                <div key={item.condition} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-sm text-slate-600">
                      {item.condition.toLowerCase().replace("_", " ")}
                    </span>
                  </div>
                  <span className="font-medium text-slate-900">{item._count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-slate-800">Listings by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.listingsByStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                    <span className="text-sm text-slate-600">{item.status.toLowerCase()}</span>
                  </div>
                  <span className="font-medium text-slate-900">{item._count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-slate-800">Reports by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.reportsByStatus.map((item) => (
                <div key={item.reportStatus[0]} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                    <span className="text-sm text-slate-600">
                      {item.reportStatus[0]?.toLowerCase() ?? "Unknown"}
                    </span>
                  </div>
                  <span className="font-medium text-slate-900">{item._count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 