"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/trpc/react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function ReportsPage() {
  const { data: listingReports } = api.report.getAllReports.useQuery();
  const { data: profileReports } = api.profileReport.getAllProfileReports.useQuery();
  
  // Use state to handle client-side rendering of dates
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const filterReports = (reports: any[], isListingReports = true) => {
    if (!reports) return [];

    let filtered = [...reports];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((report) => {
        const searchFields = isListingReports
          ? [
              report.id,
              report.reporter?.name || "",
              report.listing?.title || "",
            ]
          : [
              report.id,
              report.reporter?.name || "",
              report.reportee?.name || "",
            ];
        return searchFields.some((field) =>
          String(field).toLowerCase().includes(searchLower)
        );
      });
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (report) => (report.reportStatus?.[0] || report.status || "").toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((report) =>
        (report.reportType?.[0] || report.type || "").toLowerCase().includes(typeFilter.toLowerCase())
      );
    }

    // Time filter
    if (mounted) {  // Only apply time filtering on client
      const now = new Date();
      if (timeFilter === "today") {
        filtered = filtered.filter(
          (report) =>
            new Date(report.createdAt).toDateString() === now.toDateString()
        );
      } else if (timeFilter === "week") {
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        filtered = filtered.filter(
          (report) => new Date(report.createdAt) >= weekAgo
        );
      } else if (timeFilter === "month") {
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        filtered = filtered.filter(
          (report) => new Date(report.createdAt) >= monthAgo
        );
      }
    }

    // Sort
    if (mounted) {  // Only apply sorting on client
      filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
      });
    }

    return filtered;
  };

  const filteredListingReports = filterReports(listingReports || [], true);
  const filteredProfileReports = filterReports(profileReports || [], false);

  // Function to format date consistently
  const formatDate = (date: Date | string) => {
    if (!mounted) return ""; // Return empty string during SSR
    return format(new Date(date), "dd/MM/yyyy, HH:mm:ss");
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-sm text-muted-foreground">
            Manage and review user reports for listings and profiles
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredListingReports.length} Listing Reports •{" "}
          {filteredProfileReports.length} Profile Reports
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <Input
          placeholder="Search by ID, Reporter, Listing Title, or Reportee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xl"
        />

        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="phishing">Phishing/Scammer</SelectItem>
              <SelectItem value="mispriced">Mispriced Listings</SelectItem>
              <SelectItem value="offensive">Offensive Behaviour</SelectItem>
              <SelectItem value="suspicious">Suspicious Account</SelectItem>
              <SelectItem value="prohibited">Prohibited Item</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Past Week</SelectItem>
              <SelectItem value="month">Past Month</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="listing" className="space-y-4">
        <TabsList>
          <TabsTrigger value="listing">Listing Reports</TabsTrigger>
          <TabsTrigger value="profile">Profile Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="listing" className="space-y-4">
          <div className="rounded-md border">
            <div className="grid grid-cols-6 bg-muted/50 border-b py-3 px-4 text-sm font-medium text-muted-foreground">
              <div>ID</div>
              <div>Reporter</div>
              <div>Listing</div>
              <div>Type</div>
              <div>Status</div>
              <div>Date</div>
            </div>
            <div className="divide-y">
              {filteredListingReports.map((report) => (
                <Link
                  href={`/admin/reports/listing/${report.id}`}
                  key={report.id}
                  className="grid grid-cols-6 px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="font-mono text-sm">{report.id}</div>
                  <div>{report.reporter?.name || "Unknown"}</div>
                  <div>{report.listing?.title || "Deleted Listing"}</div>
                  <div>{report.reportType?.[0] || report.type}</div>
                  <div>
                    <Badge
                      variant={(report.reportStatus?.[0] || report.status) === "OPEN" ? "destructive" : "secondary"}
                    >
                      {report.reportStatus?.[0] || report.status}
                    </Badge>
                  </div>
                  <div>{formatDate(report.createdAt)}</div>
                </Link>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <div className="rounded-md border">
            <div className="grid grid-cols-6 bg-muted/50 border-b py-3 px-4 text-sm font-medium text-muted-foreground">
              <div>ID</div>
              <div>Reporter</div>
              <div>Reportee</div>
              <div>Type</div>
              <div>Status</div>
              <div>Date</div>
            </div>
            <div className="divide-y">
              {filteredProfileReports.map((report) => (
                <Link
                  href={`/admin/reports/profile/${report.id}`}
                  key={report.id}
                  className="grid grid-cols-6 px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="font-mono text-sm">{report.id}</div>
                  <div>{report.reporter?.name || "Unknown"}</div>
                  <div>{report.reportee?.name || "Unknown"}</div>
                  <div>{report.reportType?.[0] || report.type}</div>
                  <div>
                    <Badge
                      variant={(report.reportStatus?.[0] || report.status) === "OPEN" ? "destructive" : "secondary"}
                    >
                      {report.reportStatus?.[0] || report.status}
                    </Badge>
                  </div>
                  <div>{formatDate(report.createdAt)}</div>
                </Link>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
