"use client";

import { PresetCard } from "@/app/components/PresetCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DownloadIcon } from "lucide-react";
import { UploadPresetButton } from "@/components/UploadPresetButton";

interface Preset {
  id: string;
  title: string;
  price: number;
  soundPreviewUrl: string;
  downloadUrl: string;
}

export default function PresetsPageClient({ downloadedPresets, uploadedPresets }: { downloadedPresets: Preset[], uploadedPresets: Preset[] }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">My Presets</h1>
      <Tabs defaultValue="downloaded">
        <TabsList>
          <TabsTrigger value="downloaded">Downloaded Presets</TabsTrigger>
          <TabsTrigger value="uploaded">Uploaded Presets</TabsTrigger>
        </TabsList>
        <TabsContent value="downloaded">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {downloadedPresets?.map(
              (preset) =>
                preset && (
                  <div key={preset.id} className="relative">
                    <PresetCard
                      preset={{
                        id: preset.id,
                        name: preset.title,
                        settings: {
                          price: preset.price,
                          soundPreviewUrl: preset.soundPreviewUrl,
                          downloadUrl: preset.downloadUrl,
                        },
                      }}
                    />
                    <button
                      onClick={() => window.open(preset.downloadUrl, "_blank")}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md"
                    >
                      <DownloadIcon className="w-4 h-4" />
                    </button>
                  </div>
                )
            )}
          </div>
        </TabsContent>
        <TabsContent value="uploaded">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedPresets?.map((preset) => (
              <PresetCard
                key={preset.id}
                preset={{
                  id: preset.id,
                  name: preset.title,
                  settings: {
                    price: preset.price,
                    soundPreviewUrl: preset.soundPreviewUrl,
                    downloadUrl: preset.downloadUrl,
                  },
                }}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
      <UploadPresetButton />
    </div>
  );
}
