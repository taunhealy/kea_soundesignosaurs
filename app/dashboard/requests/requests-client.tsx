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
import { RequestCard } from "@/app/components/dashboard/RequestCard";

interface RequestsClientProps {
  userId: string;
}

export default function RequestsClient({ userId }: RequestsClientProps) {
  const [requestedThreads, assistedThreads] = useQueries({
    queries: [
      {
        queryKey: ["requests", "requested", userId],
        queryFn: async () => {
          const response = await fetch(
            `/api/request-threads?type=requested&userId=${userId}`
          );
          if (!response.ok)
            throw new Error("Failed to fetch requested threads");
          return response.json();
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
      },
      {
        queryKey: ["requests", "assisted", userId],
        queryFn: async () => {
          const response = await fetch(
            `/api/request-threads?type=assisted&userId=${userId}`
          );
          if (!response.ok) throw new Error("Failed to fetch assisted threads");
          return response.json();
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
      },
    ],
  });

  if (!requestedThreads || !assistedThreads) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Requests</h1>
        <Link href="/dashboard/requests/create">
          <Button>Create Request</Button>
        </Link>
      </div>

      <Tabs defaultValue="requested">
        <TabsList>
          <TabsTrigger value="requested">Requested</TabsTrigger>
          <TabsTrigger value="assisted">Assisted</TabsTrigger>
        </TabsList>

        <TabsContent value="requested">
          <div className="grid gap-4">
            {requestedThreads.isLoading ? (
              <div>Loading requested threads...</div>
            ) : requestedThreads.data?.map((request: any) => (
              <RequestCard
                key={request.id}
                request={request}
                type="requested"
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assisted">
          <div className="grid gap-4">
            {assistedThreads.isLoading ? (
              <div>Loading assisted threads...</div>
            ) : assistedThreads.data?.map((request: any) => (
              <RequestCard key={request.id} request={request} type="assisted" />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
