"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { api } from '~/trpc/react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { AlertCircle, Search } from "lucide-react";

interface Report {
  id: string;
  reporter: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  listing: {
    id: string;
    title: string;
    imageUrls: string[];
  };
  createdAt: Date;
  reportStatus: string[];
  reportType: string[];
}

interface ProfileReport {
  id: string;
  reporter: {
    id: string;
    name: string;
    image: string | null;
  };
  reportee: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
  reporteeId: string;
  createdAt: Date;
  reportStatus: string[];
  reportType: string[];
}

type TimeFilter = "all" | "today" | "week" | "month";
type SortOrder = "newest" | "oldest";

export const dynamic = 'force-dynamic';

export default function ReportsPage() {
  const { data: listingReports, isLoading: isListingLoading } = api.report.getAllReports.useQuery(undefined, {
    refetchOnWindowFocus: false,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
  
  const { data: profileReports, isLoading: isProfileLoading } = api.profileReport.getAllProfileReports.useQuery(undefined, {
    refetchOnWindowFocus: false,
    staleTime: 30000,
  });

  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  // Memoize filter functions to prevent unnecessary recalculations
  const filterBySearchQuery = useMemo(() => (item: Report | ProfileReport) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();

    const matchesId = item.id.toLowerCase().includes(query);
    const matchesReporter = item.reporter?.name?.toLowerCase().includes(query) ?? false;
    
    if ('listing' in item) {
      return matchesId || matchesReporter || (item.listing?.title?.toLowerCase().includes(query) ?? false);
    } else {
      return matchesId || matchesReporter || (item.reportee?.name?.toLowerCase().includes(query) ?? false);
    }
  }, [searchQuery]);

  const filterByStatus = useMemo(() => (item: Report | ProfileReport) => {
    if (statusFilter === 'all') return true;
    return item.reportStatus?.includes(statusFilter) ?? false;
  }, [statusFilter]);

  const filterByType = useMemo(() => (item: Report | ProfileReport) => {
    if (typeFilter === 'all') return true;
    return item.reportType?.includes(typeFilter) ?? false;
  }, [typeFilter]);

  const filterByTime = useMemo(() => (item: Report | ProfileReport) => {
    if (!mounted || timeFilter === "all") return true;
    
    const itemDate = new Date(item.createdAt);
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));

    switch (timeFilter) {
      case "today":
        return itemDate >= today;
      case "week":
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        return itemDate >= weekAgo;
      case "month":
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        return itemDate >= monthAgo;
      default:
        return true;
    }
  }, [timeFilter, mounted]);

  const sortByDate = useMemo(() => (a: Report | ProfileReport, b: Report | ProfileReport) => {
    if (!mounted) return 0;
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  }, [sortOrder, mounted]);

  // Memoize filtered results
  const filteredListingReports = useMemo(() => 
    listingReports
      ?.filter(report => 
        filterBySearchQuery(report) && 
        filterByStatus(report) && 
        filterByType(report) &&
        filterByTime(report)
      )
      .sort(sortByDate) || []
  , [listingReports, filterBySearchQuery, filterByStatus, filterByType, filterByTime, sortByDate]);

  const filteredProfileReports = useMemo(() => 
    profileReports
      ?.filter(report => 
        filterBySearchQuery(report) && 
        filterByStatus(report) && 
        filterByType(report) &&
        filterByTime(report)
      )
      .sort(sortByDate) || []
  , [profileReports, filterBySearchQuery, filterByStatus, filterByType, filterByTime, sortByDate]);

  const handleListingReportClick = (reportId: string) => {
    router.push(`/admin/reports/listing/${reportId}`);
  };

  const handleProfileReportClick = (reportId: string) => {
    router.push(`/admin/reports/profile/${reportId}`);
  };

  const formatDate = (date: Date | string) => {
    if (!mounted) return ""; // Return empty string during SSR
    return new Date(date).toLocaleString();
  };

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  if (isListingLoading || isProfileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-[oklch(0.428_0.11_266.57)]">Reports</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage and review user reports for listings and profiles
              </p>
            </div>
            <Badge variant="outline" className="px-4 py-1">
              <AlertCircle className="w-4 h-4 mr-1" />
              {listingReports?.length ?? 0} Listing Reports • {profileReports?.length ?? 0} Profile Reports
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ID, Reporter, Listing Title, or Reportee..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-8 rounded-full border border-input bg-white px-4 hover:bg-accent hover:text-accent-foreground">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="h-8 rounded-full border border-input bg-white px-4 hover:bg-accent hover:text-accent-foreground">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="PHISHING_SCAMMER">Phishing/Scammer</SelectItem>
                    <SelectItem value="MISPRICED_LISTINGS">Mispriced Listings</SelectItem>
                    <SelectItem value="OFFENSIVE_BEHAVIOUR_OR_CONTENT">Offensive Behaviour</SelectItem>
                    <SelectItem value="SUSPICIOUS_ACCOUNT">Suspicious Account</SelectItem>
                    <SelectItem value="SELLING_PROHIBITED_ITEM">Prohibited Item</SelectItem>
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
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="listings" className="w-full">
              <TabsList className="w-full max-w-[400px] mb-4">
                <TabsTrigger value="listings" className="flex-1">Listing Reports</TabsTrigger>
                <TabsTrigger value="profiles" className="flex-1">Profile Reports</TabsTrigger>
              </TabsList>
              <TabsContent value="listings">
                <div className="rounded-md border mt-4">
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
                      <div
                        key={report.id}
                        className="grid grid-cols-6 items-center py-4 px-4 hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleListingReportClick(report.id)}
                      >
                        <div className="font-mono text-xs truncate" title={report.id}>{report.id}</div>
                        <div className="font-medium">{report.reporter.name}</div>
                        <div>{report.listing.title}</div>
                        <div className="space-x-2 pr-4">
                          {report.reportType.map((type) => (
                            <span
                              key={type}
                              className="inline-flex items-center rounded-full border border-muted-foreground/20 px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                            >
                              {type.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                            </span>
                          ))}
                        </div>
                        <div>
                          {report.reportStatus.includes('OPEN') ? (
                            <span className="inline-flex items-center rounded-full bg-orange-50 px-2 py-1 text-xs font-medium text-orange-600">
                              OPEN
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-900">
                              CLOSED
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(report.createdAt)}
                        </div>
                      </div>
                    ))}
                    {(!filteredListingReports || filteredListingReports.length === 0) && (
                      <div className="py-8 text-center text-muted-foreground">
                        No reports found matching your filters
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="profiles">
                <div className="rounded-md border mt-4">
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
                      <div
                        key={report.id}
                        className="grid grid-cols-6 items-center py-4 px-4 hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleProfileReportClick(report.id)}
                      >
                        <div className="font-mono text-xs truncate" title={report.id}>{report.id}</div>
                        <div className="font-medium">{report.reporter.name}</div>
                        <div className="font-medium">{report.reportee?.name ?? 'Unknown User'}</div>
                        <div className="space-x-2 pr-4">
                          {report.reportType.map((type) => (
                            <span
                              key={type}
                              className="inline-flex items-center rounded-full border border-muted-foreground/20 px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                            >
                              {type.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                            </span>
                          ))}
                        </div>
                        <div>
                          {report.reportStatus.includes('OPEN') ? (
                            <span className="inline-flex items-center rounded-full bg-orange-50 px-2 py-1 text-xs font-medium text-orange-600">
                              OPEN
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-900">
                              CLOSED
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(report.createdAt)}
                        </div>
                      </div>
                    ))}
                    {(!filteredProfileReports || filteredProfileReports.length === 0) && (
                      <div className="py-8 text-center text-muted-foreground">
                        No reports found matching your filters
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 