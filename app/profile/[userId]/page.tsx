"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { PresetCard } from "@/app/components/PresetCard";
import { RequestCard } from "@/app/components/dashboard/RequestCard";

export default function UserProfilePage() {
  const params = useParams();
  const userId = params?.userId as string;

  const { data: userData } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const response = await fetch(`/api/sound-designers/user/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch user data");
      return response.json();
    },
  });

  const { data: presets } = useQuery({
    queryKey: ["userPresets", userId],
    queryFn: async () => {
      const response = await fetch(`/api/presets/user/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch presets");
      return response.json();
    },
  });

  const { data: requests } = useQuery({
    queryKey: ["userRequests", userId],
    queryFn: async () => {
      const response = await fetch(`/api/request-threads?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch requests");
      return response.json();
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{userData?.username}'s Profile</h1>
      </div>

      <Tabs defaultValue="presets">
        <TabsList>
          <TabsTrigger value="presets">Presets</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="presets">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {presets?.map((preset: any) => (
              <PresetCard key={preset.id} preset={preset} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="requests">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {requests?.map((request: any) => (
              <RequestCard key={request.id} request={request} type="requested" />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

