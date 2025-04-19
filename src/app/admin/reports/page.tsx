"use client";

import { useState } from 'react';
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
import { Label } from "~/components/ui/label";
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

export const dynamic = 'force-dynamic';

export default function ReportsPage() {
  const { data: listingReports } = api.report.getAllReports.useQuery();
  const { data: profileReports } = api.profileReport.getAllProfileReports.useQuery();
  const router = useRouter();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState('reporter');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Filter functions
  const filterBySearchQuery = (item: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();

    switch (searchField) {
      case 'id':
        return item.id.toLowerCase().includes(query);
      case 'reporter':
        return item.reporter.name.toLowerCase().includes(query);
      case 'listing':
        return 'listing' in item ? item.listing.title.toLowerCase().includes(query) : false;
      case 'reportee':
        return 'reportee' in item ? item.reportee?.name.toLowerCase().includes(query) : false;
      default:
        return true;
    }
  };

  const filterByStatus = (item: any) => {
    if (statusFilter === 'all') return true;
    return item.reportStatus.includes(statusFilter);
  };

  const filterByType = (item: any) => {
    if (typeFilter === 'all') return true;
    return item.reportType.includes(typeFilter);
  };

  const filteredListingReports = listingReports?.filter(report => 
    filterBySearchQuery(report) && filterByStatus(report) && filterByType(report)
  );

  const filteredProfileReports = profileReports?.filter(report => 
    filterBySearchQuery(report) && filterByStatus(report) && filterByType(report)
  );

  const handleListingReportClick = (reportId: string) => {
    router.push(`/admin/reports/listing/${reportId}`);
  };

  const handleProfileReportClick = (reportId: string) => {
    router.push(`/admin/reports/profile/${reportId}`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Reports</CardTitle>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Search Field</Label>
              <Select value={searchField} onValueChange={setSearchField}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select field to search" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="id">ID</SelectItem>
                  <SelectItem value="reporter">Reporter</SelectItem>
                  <SelectItem value="listing">Listing Title</SelectItem>
                  <SelectItem value="reportee">Reportee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Search Query</Label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Search by ${searchField}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Status Filter</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="OPEN">
                    <Badge variant="secondary" className="mr-2">Open</Badge>
                    Active Reports
                  </SelectItem>
                  <SelectItem value="CLOSED">
                    <Badge variant="outline" className="mr-2">Closed</Badge>
                    Resolved Reports
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Type Filter</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by type" />
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
            </div>
          </div>

          <Tabs defaultValue="listings" className="w-full">
            <TabsList className="w-full max-w-[400px] mb-4">
              <TabsTrigger value="listings" className="flex-1">Listing Reports</TabsTrigger>
              <TabsTrigger value="profiles" className="flex-1">Profile Reports</TabsTrigger>
            </TabsList>
            <TabsContent value="listings">
              <div className="rounded-lg border shadow-sm overflow-hidden">
                <div className="grid grid-cols-6 bg-muted/50 border-b py-3 px-4 text-sm font-medium text-muted-foreground">
                  <div>ID</div>
                  <div>Reporter</div>
                  <div>Listing</div>
                  <div>Type</div>
                  <div>Status</div>
                  <div>Date</div>
                </div>
                <div className="divide-y">
                  {filteredListingReports?.map((report) => (
                    <div
                      key={report.id}
                      className="grid grid-cols-6 items-center py-4 px-4 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleListingReportClick(report.id)}
                    >
                      <div className="font-mono text-xs truncate" title={report.id}>{report.id}</div>
                      <div className="font-medium">{report.reporter.name}</div>
                      <div>{report.listing.title}</div>
                      <div>
                        {report.reportType.map((type) => (
                          <Badge key={type} variant="secondary" className="mr-1 mb-1">
                            {type.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                          </Badge>
                        ))}
                      </div>
                      <div>
                        <Badge variant={report.reportStatus.includes('OPEN') ? 'secondary' : 'outline'}>
                          {report.reportStatus.join(', ')}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(report.createdAt).toLocaleString()}
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
              <div className="rounded-lg border shadow-sm overflow-hidden">
                <div className="grid grid-cols-6 bg-muted/50 border-b py-3 px-4 text-sm font-medium text-muted-foreground">
                  <div>ID</div>
                  <div>Reporter</div>
                  <div>Reportee</div>
                  <div>Type</div>
                  <div>Status</div>
                  <div>Date</div>
                </div>
                <div className="divide-y">
                  {filteredProfileReports?.map((report) => (
                    <div
                      key={report.id}
                      className="grid grid-cols-6 items-center py-4 px-4 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleProfileReportClick(report.id)}
                    >
                      <div className="font-mono text-xs truncate" title={report.id}>{report.id}</div>
                      <div className="font-medium">{report.reporter.name}</div>
                      <div className="font-medium">{report.reportee?.name ?? 'Unknown User'}</div>
                      <div>
                        {report.reportType.map((type) => (
                          <Badge key={type} variant="secondary" className="mr-1 mb-1">
                            {type.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                          </Badge>
                        ))}
                      </div>
                      <div>
                        <Badge variant={report.reportStatus.includes('OPEN') ? 'secondary' : 'outline'}>
                          {report.reportStatus.join(', ')}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(report.createdAt).toLocaleString()}
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
        </CardContent>
      </Card>
    </div>
  );
} 