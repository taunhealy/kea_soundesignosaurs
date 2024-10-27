"use client";

import { useState } from "react";
import { MyDownloads } from "./MyDownloads";
import { UploadDropdown } from "./UploadDropdown";
import { UploadPresetButton } from "@/app/components/dashboard/UploadPresetButton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";

interface DashboardContentProps {
  userId: string;
}

export function DashboardContent({ userId }: DashboardContentProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <UploadDropdown />
      </div>
      <Tabs defaultValue="samples">
        <TabsList>
          <TabsTrigger value="samples">Samples</TabsTrigger>
          <TabsTrigger value="presets">Presets</TabsTrigger>
        </TabsList>
        <TabsContent value="samples">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MyDownloads activeTab="samples" userId={userId} />
          </div>
        </TabsContent>
        <TabsContent value="presets">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MyDownloads activeTab="presets" userId={userId} />
            <UploadPresetButton />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
