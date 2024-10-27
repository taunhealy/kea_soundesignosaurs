"use client";

import { useState, useEffect } from "react";
import { PresetCard } from "@/app/components/PresetCard";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { DownloadIcon } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import Link from "next/link";

interface Preset {
  id: string;
  title: string;
  price: number;
  soundPreviewUrl: string;
  spotifyLink?: string;
  downloadUrl?: string;
}

export default function PresetsPage() {
  const [downloadedPresets, setDownloadedPresets] = useState<Preset[]>([]);
  const [uploadedPresets, setUploadedPresets] = useState<Preset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPresets = async () => {
      setIsLoading(true);
      try {
        const downloadedResponse = await fetch(
          "/api/presets/user?type=downloaded"
        );
        const uploadedResponse = await fetch("/api/presets/user?type=uploaded");

        if (!downloadedResponse.ok || !uploadedResponse.ok) {
          throw new Error("Failed to fetch presets");
        }

        const downloadedData = await downloadedResponse.json();
        const uploadedData = await uploadedResponse.json();

        setDownloadedPresets(downloadedData);
        setUploadedPresets(uploadedData);
      } catch (err) {
        setError("Error fetching presets");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPresets();
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">My Presets</h1>
        <Link href="/dashboard/presets/create">
          <Button>Upload Preset</Button>
        </Link>
      </div>
      {uploadedPresets.length === 0 && downloadedPresets.length === 0 ? (
        <div className="text-center py-8">
          <p className="mb-4">You don't have any presets yet.</p>
          <Link href="/dashboard/presets/create">
            <Button>Create Your First Preset</Button>
          </Link>
        </div>
      ) : (
        <Tabs defaultValue="downloaded">
          <TabsList>
            <TabsTrigger value="downloaded">Downloaded Presets</TabsTrigger>
            <TabsTrigger value="uploaded">Uploaded Presets</TabsTrigger>
          </TabsList>
          <TabsContent value="downloaded">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {downloadedPresets.map((preset) => (
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
              ))}
            </div>
          </TabsContent>
          <TabsContent value="uploaded">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedPresets.map((preset) => (
                <PresetCard
                  key={preset.id}
                  preset={{
                    id: preset.id,
                    name: preset.title,
                    settings: {
                      price: preset.price,
                      soundPreviewUrl: preset.soundPreviewUrl,
                      spotifyLink: preset.spotifyLink, // Changed from downloadUrl
                    },
                  }}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
