"use client";

import { useState } from "react";
import { SearchSidebar } from "@/app/components/SearchSidebar";
import { PresetsContainer } from "@/app/components/PresetsContainer";
import { SearchFilters } from "@/types/SearchTypes";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { PriceType, ContentType, PresetType } from "@prisma/client";

export default function HomePage() {
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

  const [contentType, setContentType] = useState<"presets" | "packs">(
    "presets"
  );

  return (
    <div className="flex-col container gap-5 px-4 py-8 overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Explore {contentType === "presets" ? "Presets" : "Preset Packs"}
        </h1>
      </div>

      <div className="flex gap-6 overflow-hidden">
        <div className="w-64 flex-shrink-0">
          <SearchSidebar filters={filters} setFilters={setFilters} />
        </div>

        <div className="flex-auto">
          <div className="flex flex-col gap-4">
            <Tabs
              value={contentType}
              onValueChange={(value) =>
                setContentType(value as "presets" | "packs")
              }
              className="w-full"
            >
              <TabsList className="w-full">
                <TabsTrigger value="presets" className="flex-1">
                  Presets
                </TabsTrigger>
                <TabsTrigger value="packs" className="flex-1">
                  Preset Packs
                </TabsTrigger>
              </TabsList>

              <TabsContent value="presets">
                <Tabs defaultValue="all" className="w-full mt-4">
                  <TabsList>
                    <TabsTrigger value="all">All Presets</TabsTrigger>
                    <TabsTrigger value="free">Free</TabsTrigger>
                    <TabsTrigger value="premium">Premium</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all">
                    <PresetsContainer
                      filters={{
                        ...filters,
                        priceTypes: [PriceType.FREE, PriceType.PREMIUM],
                        contentType: ContentType.PRESETS,
                      }}
                      type="uploaded"
                      contentType={ContentType.PRESETS}
                    />
                  </TabsContent>
                  <TabsContent value="free">
                    <PresetsContainer
                      filters={{
                        ...filters,
                        priceTypes: [PriceType.FREE],
                        contentType: ContentType.PRESETS,
                      }}
                      type="uploaded"
                      contentType={ContentType.PRESETS}
                    />
                  </TabsContent>
                  <TabsContent value="premium">
                    <PresetsContainer
                      filters={{
                        ...filters,
                        priceTypes: [PriceType.PREMIUM],
                        contentType: ContentType.PRESETS,
                      }}
                      type="uploaded"
                      contentType={ContentType.PRESETS}
                    />
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value="packs">
                <Tabs defaultValue="all" className="w-full mt-4">
                  <TabsList>
                    <TabsTrigger value="all">All Packs</TabsTrigger>
                    <TabsTrigger value="free">Free</TabsTrigger>
                    <TabsTrigger value="premium">Premium</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all">
                    <PresetsContainer
                      filters={{
                        ...filters,
                        priceTypes: [PriceType.FREE, PriceType.PREMIUM],
                        contentType: ContentType.PACKS,
                      }}
                      type="uploaded"
                      contentType={ContentType.PACKS}
                    />
                  </TabsContent>
                  <TabsContent value="free">
                    <PresetsContainer
                      filters={{
                        ...filters,
                        priceTypes: [PriceType.FREE],
                        contentType: ContentType.PACKS,
                      }}
                      type="uploaded"
                      contentType={ContentType.PACKS}
                    />
                  </TabsContent>
                  <TabsContent value="premium">
                    <PresetsContainer
                      filters={{
                        ...filters,
                        priceTypes: [PriceType.PREMIUM],
                        contentType: ContentType.PACKS,
                      }}
                      type="uploaded"
                      contentType={ContentType.PACKS}
                    />
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
