"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";

interface AnalyticsData {
  packageClicks: number;
  websiteClicks: number;
  availabilityRequests: number;
}

async function fetchAnalytics(userId: string): Promise<AnalyticsData> {
  const response = await fetch(`/api/photographer-analytics/${userId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch analytics data");
  }
  return response.json();
}

const PhotographerAnalytics = ({ userId }: { userId: string }) => {
  const {
    data: analyticsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["photographerAnalytics", userId],
    queryFn: () => fetchAnalytics(userId),
  });

  if (isLoading) return <div>Loading analytics...</div>;
  if (error) return <div>Error loading analytics: {error.message}</div>;
  if (!analyticsData) return null;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Package Clicks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {analyticsData.packageClicks}
          </div>
          <p className="text-xs text-muted-foreground">Last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Website URL Clicks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {analyticsData.websiteClicks}
          </div>
          <p className="text-xs text-muted-foreground">Last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Availability Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {analyticsData.availabilityRequests}
          </div>
          <p className="text-xs text-muted-foreground">Last month</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PhotographerAnalytics;
