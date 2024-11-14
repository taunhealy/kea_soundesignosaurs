"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { ContentType } from "@prisma/client";
import { ContentViewMode, RequestViewMode } from "@/types/enums";

interface CategoryTabsProps {
  selectedContentType: ContentType;
  onSelect: (contentType: ContentType) => void;
}

interface TabItem {
  value: ContentType;
  label: string;
  defaultView: ContentViewMode | RequestViewMode;
}

const TAB_ITEMS: TabItem[] = [
  {
    value: ContentType.PRESETS,
    label: "Presets",
    defaultView: ContentViewMode.EXPLORE,
  },
  {
    value: ContentType.PACKS,
    label: "Packs",
    defaultView: ContentViewMode.EXPLORE,
  },
  {
    value: ContentType.REQUESTS,
    label: "Requests",
    defaultView: RequestViewMode.PUBLIC,
  },
];

export function CategoryTabs({
  selectedContentType,
  onSelect,
}: CategoryTabsProps) {
  const searchParams = useSearchParams();
  const currentView = searchParams?.get("view");

  const getDefaultView = (contentType: ContentType): string => {
    return contentType === ContentType.REQUESTS
      ? RequestViewMode.REQUESTED
      : ContentViewMode.UPLOADED;
  };

  const getTabHref = (contentType: ContentType): string => {
    const view = currentView || getDefaultView(contentType);
    return `/${contentType.toLowerCase()}?view=${view}`;
  };

  return (
    <Tabs value={selectedContentType.toLowerCase()} className="mb-4">
      <TabsList>
        {TAB_ITEMS.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value.toLowerCase()} asChild>
            <Link href={getTabHref(tab.value)}>{tab.label}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
