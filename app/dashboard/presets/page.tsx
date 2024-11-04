"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PresetsContainer } from "@/app/components/PresetsContainer";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { UploadPresetButton } from "@/app/components/dashboard/UploadPresetButton";
import { SearchSidebar } from "@/app/components/SearchSidebar";
import { SearchFilters } from "@/types/SearchTypes";
import { ContentType } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

interface Preset {
  id: string;
  title: string;
  description?: string;
  presetType: string;
  genre?: {
    id: string;
    name: string;
    type: string;
  };
  vst?: {
    id: string;
    name: string;
    type: string;
  };
  // ... add other fields as needed
}

export default function PresetsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"uploaded" | "downloaded">(
    (searchParams.get("type") as "uploaded" | "downloaded") || "uploaded"
  );
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: "",
    genres: [],
    vsts: [],
    presetTypes: [],
    tags: [],
    category: "",
    showAll: false,
    types: [],
    priceTypes: [],
    contentType: ContentType.PRESETS,
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value as "uploaded" | "downloaded");
    router.push(`/dashboard/presets?type=${value}`);
  };

  const { data: presets, isLoading } = useQuery<Preset[]>({
    queryKey: ["presets", "uploaded"],
    queryFn: async () => {
      const response = await fetch("/api/presets?type=uploaded");
      if (!response.ok) throw new Error("Failed to fetch presets");
      return response.json();
    },
  });

  return (
    <div className="flex-col w-auto min-w-[1000px] container gap-5 px-4 py-8 overflow-hidden">
      <div className="flex justify-between items-center mb-6 min-w-full">
        <h1 className="text-2xl font-bold">My Presets</h1>
        <UploadPresetButton />
      </div>
      <div className="flex min-w-full w-full gap-6 overflow-hidden">
        <div className="w-64 flex-shrink-0">
          <SearchSidebar filters={filters} setFilters={setFilters} />
        </div>
        <div className="flex-auto w-full">
          <Tabs
            defaultValue={activeTab}
            className="w-full"
            onValueChange={handleTabChange}
          >
            <TabsList>
              <TabsTrigger value="uploaded">Uploaded</TabsTrigger>
              <TabsTrigger value="downloaded">Downloaded</TabsTrigger>
            </TabsList>
            <TabsContent value="uploaded">
              <PresetsContainer
                type="uploaded"
                filters={filters}
                contentType={ContentType.PRESETS}
              />
            </TabsContent>
            <TabsContent value="downloaded">
              <PresetsContainer
                type="downloaded"
                filters={filters}
                contentType={ContentType.PRESETS}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : presets && presets.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {presets.map((preset) => (
            <div key={preset.id} className="border p-4 rounded-lg">
              <h3 className="font-bold">{preset.title}</h3>
              <p>{preset.description}</p>
              <p>Type: {preset.presetType}</p>
              {preset.genre && <p>Genre: {preset.genre.name}</p>}
              {preset.vst && <p>VST: {preset.vst.name}</p>}
            </div>
          ))}
        </div>
      ) : (
        <div>No presets found</div>
      )}
    </div>
  );
}
