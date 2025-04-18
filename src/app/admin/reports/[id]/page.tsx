"use client";

import { useParams, useRouter } from 'next/navigation';
import { api } from '~/trpc/react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: report } = api.report.getReportById.useQuery(
    params.id as string
  );

  if (!report) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Reports
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Reporter Information */}
          <div>
            <h3 className="font-semibold mb-2">Reporter Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p>{report.reporter.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p>{report.reporter.email}</p>
              </div>
            </div>
          </div>

          {/* Listing Information */}
          <div>
            <h3 className="font-semibold mb-2">Listing Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Title</p>
                <p>{report.listing.title}</p>
              </div>
              {report.listing.imageUrls.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Images</p>
                  <div className="flex gap-2 mt-1">
                    {report.listing.imageUrls.map((url: string, index: number) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Listing image ${index + 1}`}
                        className="h-20 w-20 object-cover rounded"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Report Status */}
          <div>
            <h3 className="font-semibold mb-2">Report Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Report Type</p>
                <p>{report.reportType.join(', ')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Status</p>
                <p>{report.reportStatus.join(', ')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date Reported</p>
                <p>{new Date(report.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Body Text</p>
                <p className="whitespace-pre-wrap">{report.bodyText}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button
              variant="destructive"
              onClick={() => {
                // Handle report action (e.g., close report)
                console.log('Action taken on report:', report.id);
              }}
            >
              Close Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 