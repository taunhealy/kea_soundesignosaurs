"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { PresetRequestGrid } from "@/app/components/shared/PresetRequestGrid";

export default function PresetRequestsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"public" | "requested" | "assisted">(
    (searchParams.get("type") as "public" | "requested" | "assisted") || "public"
  );

  const handleTabChange = (value: string) => {
    setActiveTab(value as "public" | "requested" | "assisted");
    router.push(`/dashboard/requests?type=${value}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Preset Requests</h1>
        <Button onClick={() => router.push("/dashboard/requests/create")}>
          Create Request
        </Button>
      </div>

      <Tabs
        defaultValue={activeTab}
        className="w-full"
        onValueChange={handleTabChange}
      >
        <TabsList>
          <TabsTrigger value="public">Public</TabsTrigger>
          <TabsTrigger value="requested">Requested</TabsTrigger>
          <TabsTrigger value="assisted">Assisted</TabsTrigger>
        </TabsList>

        <TabsContent value="public">
          <PresetRequestGrid type="public" />
        </TabsContent>

        <TabsContent value="requested">
          <PresetRequestGrid type="requested" />
        </TabsContent>

        <TabsContent value="assisted">
          <PresetRequestGrid type="assisted" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
