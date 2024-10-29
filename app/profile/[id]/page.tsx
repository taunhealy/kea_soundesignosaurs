"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { PresetCard } from "@/app/components/PresetCard";
import { RequestCard } from "@/app/components/dashboard/RequestCard";

export default function UserProfilePage() {
  const params = useParams();
  const userId = params?.id as string;

  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const response = await fetch(`/api/sound-designers/user/${userId}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error("Failed to fetch user data");
      }
      return response.json();
    },
  });

  const { data: submissions = [], isLoading: isLoadingSubmissions } = useQuery({
    queryKey: ["userSubmissions", userId],
    queryFn: async () => {
      const response = await fetch(`/api/submissions/user/${userId}`);
      if (!response.ok) {
        if (response.status === 404) return [];
        throw new Error("Failed to fetch submissions");
      }
      return response.json();
    },
  });

  const { data: requests = [], isLoading: isLoadingRequests } = useQuery({
    queryKey: ["userRequests", userId],
    queryFn: async () => {
      const response = await fetch(`/api/request-threads?userId=${userId}`);
      if (!response.ok) {
        if (response.status === 404) return [];
        throw new Error("Failed to fetch requests");
      }
      return response.json();
    },
  });

  if (isLoadingUser) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!userData) {
    return <div className="container mx-auto px-4 py-8">User not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{userData.username}'s Profile</h1>
      </div>

      <Tabs defaultValue="submissions">
        <TabsList>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="submissions">
          {isLoadingSubmissions ? (
            <div>Loading submissions...</div>
          ) : submissions.length === 0 ? (
            <div>No submissions found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {submissions.map((submission: any) => (
                <PresetCard key={submission.id} preset={submission} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests">
          {isLoadingRequests ? (
            <div>Loading requests...</div>
          ) : requests.length === 0 ? (
            <div>No requests found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {requests.map((request: any) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  type="requested"
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
