"use client";

import { usePresets } from "@/app/hooks/usePresets";
import { PresetCard } from "@/app/components/PresetCard";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { Button } from "@/app/components/ui/button";
import Link from "next/link";
import { PresetSettings } from "@/app/components/PresetCard";
import { useAuth } from "@clerk/nextjs";

// Define the Preset type
interface Preset {
  id: string;
  name: string;
  settings: PresetSettings;
  soundDesigner?: {
    username: string;
    profileImage: string;
  };
  genre?: {
    name: string;
  };
  vst?: {
    name: string;
  };
  presetType?: string;
}

export default function PresetsPage() {
  const { userId } = useAuth();
  const { data: downloadedPresets, isLoading: isDownloadedLoading } =
    usePresets("downloaded");
  const { data: uploadedPresets, isLoading: isUploadedLoading } =
    usePresets("uploaded");

  if (isDownloadedLoading || isUploadedLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Guides</h1>
        <Button asChild>
          <Link href="/dashboard/presets/create">Upload New Preset</Link>
        </Button>
      </div>

      <Tabs defaultValue="downloaded">
        <TabsList>
          <TabsTrigger value="downloaded">Downloaded Guides</TabsTrigger>
          <TabsTrigger value="uploaded">Uploaded Guides</TabsTrigger>
        </TabsList>
        <TabsContent value="downloaded">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {downloadedPresets?.length > 0 ? (
              downloadedPresets.map((preset: Preset) => (
                <PresetCard key={preset.id} preset={preset} />
              ))
            ) : (
              <div>No downloaded guides available</div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="uploaded">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedPresets?.length > 0 ? (
              uploadedPresets.map((preset: Preset) => (
                <PresetCard key={preset.id} preset={preset} />
              ))
            ) : (
              <div>No uploaded guides available</div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
