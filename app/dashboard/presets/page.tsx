"use client";

import { useState } from "react";
import PresetsContent from "@/app/components/PresetsContent";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { UploadPresetButton } from "@/app/components/dashboard/UploadPresetButton";
import { SearchFilters, SearchSidebar } from "@/app/components/SearchSidebar";

export default function PresetsPage() {
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: "",
    genres: [],
    vsts: [],
    presetTypes: [],
    tags: [],
    category: "",
    showAll: false,
    types: [],
  });

  return (
    <div className="flex-col w-auto min-w-[2000px] container gap-5 px-4 py-8 overflow-hidden">
      <div className="flex justify-between items-center mb-6 min-w-full">
        <h1 className="text-2xl font-bold">My Presets</h1>
        <UploadPresetButton />
      </div>
      <div className="flex min-w-full w-full gap-6 overflow-hidden">
        <div className="w-64 flex-shrink-0">
          <SearchSidebar filters={filters} setFilters={setFilters} />
        </div>
        <div className="flex-auto w-full">
          <Tabs defaultValue="uploaded" className="w-full">
            <TabsList>
              <TabsTrigger value="uploaded">Uploaded</TabsTrigger>
              <TabsTrigger value="downloaded">Downloaded</TabsTrigger>
            </TabsList>
            <TabsContent value="uploaded">
              <PresetsContent type="uploaded" filters={filters} />
            </TabsContent>
            <TabsContent value="downloaded">
              <PresetsContent type="downloaded" filters={filters} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
