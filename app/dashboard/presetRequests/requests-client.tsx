"use client";

import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { useQuery, useQueries } from "@tanstack/react-query";
import { PresetRequestCard } from "@/app/components/dashboard/PresetRequestCard";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

export default function RequestsClient() {
  const { userId } = useAuth();

  const [presetRequests, assistedRequests] = useQueries({
    queries: [
      {
        queryKey: ["presetRequests", "requested", userId],
        queryFn: async () => {
          const response = await fetch(
            `/api/presetRequest?type=requested&userId=${userId}`
          );
          if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(
              error.message || "Failed to fetch requested preset requests"
            );
          }
          return response.json();
        },
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
      },
      {
        queryKey: ["presetRequests", "assisted", userId],
        queryFn: async () => {
          const response = await fetch(
            `/api/presetRequest?type=assisted&userId=${userId}`
          );
          if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(
              error.message || "Failed to fetch assisted preset requests"
            );
          }
          return response.json();
        },
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
      },
    ],
  });

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  if (presetRequests.error || assistedRequests.error) {
    console.error("Error fetching preset requests:", {
      requested: presetRequests.error,
      assisted: assistedRequests.error,
    });
    return (
      <div className="p-4 text-red-500">
        Error loading preset requests. Please try again later.
      </div>
    );
  }

  if (!presetRequests || !assistedRequests) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Preset Requests</h1>
        <Link href="/dashboard/presetRequest/create">
          <Button>Create Request</Button>
        </Link>
      </div>

      <Tabs defaultValue="requested" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="requested" className="flex-1">
            Requested
          </TabsTrigger>
          <TabsTrigger value="assisted" className="flex-1">
            Assisted
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requested">
          <div className="grid gap-4">
            {presetRequests.isLoading ? (
              <div className="text-center p-4 text-muted-foreground">
                Loading requested preset requests...
              </div>
            ) : presetRequests.data?.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground">
                No requests to display.
              </div>
            ) : (
              presetRequests.data?.map((request: any) => (
                <div key={request.id} className="space-y-4">
                  <PresetRequestCard
                    request={request}
                    type="requested"
                    showSubmissions={true}
                  />
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="assisted">
          <div className="grid gap-4">
            {assistedRequests.isLoading ? (
              <div className="text-center p-4 text-muted-foreground">
                Loading assisted preset requests...
              </div>
            ) : assistedRequests.data?.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground">
                No assisted requests to display.
              </div>
            ) : (
              assistedRequests.data?.map((request: any) => (
                <div key={request.id} className="space-y-4">
                  <PresetRequestCard
                    request={request}
                    type="assisted"
                    showSubmissions={true}
                  />
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
