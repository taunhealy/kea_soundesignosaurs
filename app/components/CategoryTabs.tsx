"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { SearchFilters } from "@/types/SearchTypes";
import { ContentType } from "@prisma/client";
import { useEffect } from "react";

interface CategoryTabsProps {
  selectedContentType: ContentType;
  onSelect: (contentType: ContentType) => void;
}

export function CategoryTabs({
  selectedContentType,
  onSelect,
}: CategoryTabsProps) {
  const searchParams = useSearchParams();
  const category = searchParams?.get("category") || "presets";

  useEffect(() => {
    // Map category to ContentType
    const contentTypeMap = {
      presets: ContentType.PRESETS,
      packs: ContentType.PACKS,
      requests: ContentType.REQUESTS,
    };
    
    const newContentType = contentTypeMap[category as keyof typeof contentTypeMap];
    if (newContentType && newContentType !== selectedContentType) {
      onSelect(newContentType);
    }
  }, [category, selectedContentType, onSelect]);

  return (
    <Tabs value={category} className="mb-4">
      <TabsList>
        <TabsTrigger value="presets" asChild>
          <Link href="/?category=presets">Presets</Link>
        </TabsTrigger>
        <TabsTrigger value="packs" asChild>
          <Link href="/?category=packs">Packs</Link>
        </TabsTrigger>
        <TabsTrigger value="requests" asChild>
          <Link href="/?category=requests">Requests</Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
