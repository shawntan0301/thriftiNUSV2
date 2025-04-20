"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '~/trpc/react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { ArrowLeft, User, FileText, Star, ExternalLink } from 'lucide-react';
import { ReportStatus, ReportTopic } from '@prisma/client';
import { use } from 'react';
import Link from 'next/link';

interface ProfileReportPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface ReportType {
  id: string;
  reporterId: string;
  reporteeId: string;
  reportType: ReportTopic[];
  reportStatus: ReportStatus[];
  createdAt: Date;
  bodyText: string;
  reporter: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  reportee: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
}

export default function ProfileReportPage({ params }: ProfileReportPageProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const resolvedParams = use(params);

  const { data: report, isLoading } = api.profileReport.getReportById.useQuery({
    id: resolvedParams.id,
  });

  const closeReportMutation = api.profileReport.closeReport.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading report details...</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Report not found</div>
      </div>
    );
  }

  const handleCloseReport = () => {
    closeReportMutation.mutate(report.id);
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Reports
        </Button>
        <Button 
          variant="destructive" 
          onClick={handleCloseReport} 
          disabled={closeReportMutation.status === 'pending' || !report.reportStatus.includes(ReportStatus.OPEN)}
        >
          {closeReportMutation.status === 'pending' ? 'Closing...' : 'Close Report'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content - Report Details */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <CardTitle>Report Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Report Type</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {report.reportType.map((type: ReportTopic) => (
                    <span
                      key={type}
                      className="inline-flex items-center rounded-full border border-slate-200 bg-transparent px-3 py-1 text-xs text-slate-600"
                    >
                      {type.split('_').map((word: string) => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Current Status</div>
                {report.reportStatus.includes(ReportStatus.OPEN) ? (
                  <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-orange-600">
                    OPEN
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600">
                    CLOSED
                  </span>
                )}
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Date Reported</div>
                <div className="mt-1">{new Date(report.createdAt).toLocaleString()}</div>
              </div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-2">Report Description</div>
              <div className="p-4 rounded-lg bg-muted/50">
                {report.bodyText || 'No description provided'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar - Reporter Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <CardTitle>Reporter Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Name</div>
                <Link href={`/users/${report.reporter.id}`} className="flex items-center gap-1 text-primary hover:underline">
                  {report.reporter.name}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="break-all">{report.reporter.email}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Rating</div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span>No ratings</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Activity</div>
                <div className="grid grid-cols-2 gap-4 mt-1">
                  <div>
                    <div className="font-medium">0</div>
                    <div className="text-sm text-muted-foreground">Listings</div>
                  </div>
                  <div>
                    <div className="font-medium">0</div>
                    <div className="text-sm text-muted-foreground">Reviews</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {report.reportee && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <CardTitle>Reported User</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Name</div>
                  <Link href={`/users/${report.reportee.id}`} className="flex items-center gap-1 text-primary hover:underline">
                    {report.reportee.name}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="break-all">{report.reportee.email}</div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 