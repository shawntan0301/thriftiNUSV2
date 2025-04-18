"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { api } from '~/trpc/react';
import { useRouter } from 'next/navigation';

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

export const dynamic = 'force-dynamic';

export default function ReportsPage() {
  const { data: reports } = api.report.getAllReports.useQuery();
  const [filter, setFilter] = useState('');
  const router = useRouter();

  const filteredReports = reports?.filter((report) =>
    report.reporter.name.toLowerCase().includes(filter.toLowerCase())
  );

  const handleRowClick = (reportId: string) => {
    router.push(`/admin/reports/${reportId}`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <input
            type="text"
            placeholder="Search by reporter..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="mb-4 w-full p-2 border rounded"
          />
          <div className="rounded-md border">
            <div className="grid grid-cols-6 border-b py-3 text-sm font-medium text-muted-foreground">
              <div className="px-4">ID</div>
              <div className="px-4">Reporter</div>
              <div className="px-4">Listing</div>
              <div className="px-4">Type</div>
              <div className="px-4">Status</div>
              <div className="px-4">Date</div>
            </div>
            <div className="divide-y">
              {filteredReports?.map((report) => (
                <div
                  key={report.id}
                  className="grid grid-cols-6 items-center py-3 hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => handleRowClick(report.id)}
                >
                  <div className="px-4">{report.id}</div>
                  <div className="px-4">{report.reporter.name}</div>
                  <div className="px-4">{report.listing.title}</div>
                  <div className="px-4">{report.reportType.join(', ')}</div>
                  <div className="px-4">{report.reportStatus.join(', ')}</div>
                  <div className="px-4">{new Date(report.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 