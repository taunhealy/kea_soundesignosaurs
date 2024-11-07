"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { Button } from "@/app/components/ui/button";
import { PresetPackGrid } from "@/app/components/shared/PresetPackGrid";
import { usePresetPacks } from "@/app/hooks/queries/usePresetPacks";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { UserStatus } from "@/types/enums";
import { ContentType } from "@prisma/client";
export default function PacksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<"uploaded" | "downloaded">(
    (searchParams.get("type") as "uploaded" | "downloaded") || "uploaded"
  );

  const { data: packs, isLoading } = usePresetPacks({
    searchTerm: "",
    page: 1,
    pageSize: 10,
    contentType: ContentType.PACKS,
    userStatus:
      activeTab === "uploaded" ? UserStatus.UPLOADED : UserStatus.DOWNLOADED,
    sortBy: "createdAt",
    sortOrder: "desc",
    priceTypes: [],
    genres: [],
    vstTypes: [],
    presetTypes: [],
    tags: [],
    showAll: false,
    categories: [],
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value as "uploaded" | "downloaded");
    router.push(`/dashboard/packs?type=${value}`);
  };

  return (
    <div className="flex-col w-auto min-w-[1000px] container gap-5 px-4 py-8 overflow-hidden">
      <div className="flex justify-between items-center mb-6 min-w-full">
        <h1 className="text-2xl font-bold">My Preset Packs</h1>
        <Link href="/dashboard/packs/create">
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Pack
          </Button>
        </Link>
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
            <PresetPackGrid
              packs={packs || []}
              type="uploaded"
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="downloaded">
            <PresetPackGrid
              packs={packs || []}
              type="downloaded"
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
