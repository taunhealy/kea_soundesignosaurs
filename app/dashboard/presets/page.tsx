"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { UploadPresetButton } from "@/app/components/dashboard/UploadPresetButton";
import { SearchSidebar } from "@/app/components/SearchSidebar";
import { PresetGrid } from "@/app/components/shared/PresetGrid";
import { usePresets } from "@/app/hooks/queries/usePresets";
import { useSearch } from "@/contexts/SearchContext";
import { SearchFilters } from "@/types/SearchTypes";
import { UserStatus } from "@/types/enums";

export default function PresetsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { filters, updateFilter } = useSearch();

  const [activeTab, setActiveTab] = useState<"uploaded" | "downloaded">(
    (searchParams.get("type") as "uploaded" | "downloaded") || "uploaded"
  );

  const { data: presets, isLoading } = usePresets(activeTab);

  useEffect(() => {
    const status =
      activeTab === "uploaded" ? UserStatus.UPLOADED : UserStatus.DOWNLOADED;
    if (filters.userStatus !== status) {
      updateFilter("userStatus", status);
    }
  }, [activeTab]);

  const handleSearch = (newFilters: Partial<SearchFilters>) => {
    const { userStatus } = filters;
    Object.entries(newFilters).forEach(([key, value]) => {
      if (key !== "userStatus") {
        updateFilter(key as keyof SearchFilters, value);
      }
    });
  };

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
        <SearchSidebar filters={filters} onSubmit={handleSearch} />
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
              <PresetGrid
                presets={presets}
                viewMode="uploaded"
                isLoading={isLoading}
              />
            </TabsContent>
            <TabsContent value="downloaded">
              <PresetGrid
                presets={presets}
                viewMode="downloaded"
                isLoading={isLoading}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
