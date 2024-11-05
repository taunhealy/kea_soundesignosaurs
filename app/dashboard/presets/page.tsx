"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { UserStatus } from "@/types/enums";
import { DisplayMode } from "@/types/enums";
import { PresetGrid } from "@/app/components/shared/PresetGrid";

export default function PresetsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"uploaded" | "downloaded">(
    (searchParams.get("type") as "uploaded" | "downloaded") || "uploaded"
  );
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: "",
    genres: [],
    vstTypes: [],
    presetTypes: [],
    tags: [],
    showAll: false,
    priceTypes: [],
    contentType: ContentType.PRESETS,
    displayMode: DisplayMode.BROWSE,
    userStatus: UserStatus.UPLOADED,
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value as "uploaded" | "downloaded");
    router.push(`/dashboard/presets?type=${value}`);
  };

  return (
    <div className="flex-col w-auto min-w-[1000px] container gap-5 px-4 py-8 overflow-hidden">
      <div className="flex justify-between items-center mb-6 min-w-full">
        <h1 className="text-2xl font-bold">My Presets</h1>
        <UploadPresetButton />
      </div>
      <div className="flex min-w-full w-full gap-6 overflow-hidden">
        <div className="w-64 flex-shrink-0">
          <SearchSidebar />
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
              <PresetGrid />
            </TabsContent>
            <TabsContent value="downloaded">
              <PresetGrid />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
