"use client";

import { useParams, useRouter } from 'next/navigation';
import { api } from '~/trpc/react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { ArrowLeft, ExternalLink, Flag, Image as ImageIcon, User, AlertCircle, Star, Check } from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';

export default function ListingReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const utils = api.useUtils();

  const { id } = params || {};

  if (!id) {
    return <div>Error: No listing ID provided.</div>;
  }

  const { data: report, isLoading } = api.report.getReportById.useQuery(
    id as string
  );

  const { mutate: closeReport } = api.report.closeReport.useMutation({
    onSuccess: () => {
      toast.success('Report closed successfully');
      utils.report.getReportById.invalidate(id as string);
      utils.report.getAllReports.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="w-8 h-8 text-muted-foreground" />
        <p className="text-muted-foreground">Report not found</p>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Reports
        </Button>
        <div className="flex items-center gap-2">
          {report.reportStatus.includes('OPEN') ? (
            <Button
              variant="ghost"
              onClick={() => closeReport(report.id)}
              className="flex items-center gap-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            >
              <Flag className="h-4 w-4" />
              Close Report
            </Button>
          ) : (
            <Badge variant="outline" className="px-3 py-1">Report Closed</Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 grid-cols-4">
        {/* Report Details - Left Side (3/4) */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Flag className="h-5 w-5" />
              Report Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Report Type</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {report.reportType.map((type) => (
                    <span
                      key={type}
                      className="inline-flex items-center rounded-full border border-muted-foreground/20 px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                    >
                      {type.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Status</p>
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
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date Reported</p>
                <p className="mt-1">{new Date(report.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Report Description</p>
              <p className="mt-1 whitespace-pre-wrap rounded-lg border bg-muted/50 p-4">
                {report.bodyText}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Right Side Information (1/4) */}
        <div className="col-span-1 space-y-6">
          {/* Reporter Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <User className="h-5 w-5" />
                Reporter Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <Link 
                  href={`/my-listings/view?id=${report.reporter.id}`}
                  className="flex items-center gap-2 text-primary hover:underline mt-1"
                >
                  {report.reporter.name}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p>{report.reporter.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rating</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{report.reporter.rating?.toFixed(1) ?? 'No ratings'}</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Activity</p>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>
                    <p className="text-sm text-muted-foreground">Listings</p>
                    <p className="font-medium">{report.reporter.listingsCount ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Reviews</p>
                    <p className="font-medium">{report.reporter.reviewsCount ?? 0}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Listing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <ImageIcon className="h-5 w-5" />
                Listing Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Title</p>
                <Link 
                  href={`/listing/view?id=${report.listing.id}`}
                  className="flex items-center gap-2 text-primary hover:underline mt-1"
                >
                  {report.listing.title}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
              {report.listing.imageUrls && report.listing.imageUrls.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Images</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Array.isArray(report.listing.imageUrls) ? 
                      report.listing.imageUrls.map((url, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                          <img
                            src={url}
                            alt={`Listing image ${index + 1}`}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      )) : (
                        <div className="relative aspect-square rounded-lg overflow-hidden border">
                          <img
                            src={report.listing.imageUrls}
                            alt="Listing image"
                            className="object-cover w-full h-full"
                          />
                        </div>
                      )
                    }
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 