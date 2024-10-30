"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import PresetsContent from "@/app/components/PresetsContent";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { UploadPresetButton } from "@/app/components/dashboard/UploadPresetButton";
import { useEffect } from "react";

export default function PresetsPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Presets</h1>
        <UploadPresetButton />
      </div>

      <Tabs defaultValue="uploaded">
        <TabsList>
          <TabsTrigger value="uploaded">Uploaded</TabsTrigger>
          <TabsTrigger value="downloaded">Downloaded</TabsTrigger>
        </TabsList>
        <TabsContent value="uploaded">
          <PresetsContent type="uploaded" />
        </TabsContent>
        <TabsContent value="downloaded">
          <PresetsContent type="downloaded" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
