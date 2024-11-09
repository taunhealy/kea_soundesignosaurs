"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { ContentType } from "@prisma/client";
import { BoardView, ContentViewMode, RequestViewMode } from "@/types/enums";

interface CategoryTabsProps {
  selectedContentType: ContentType;
  onSelect: (contentType: ContentType) => void;
  boardView: BoardView;
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
  boardView,
}: CategoryTabsProps) {
  const searchParams = useSearchParams();
  const currentView = searchParams?.get("view");
  const basePath = boardView === BoardView.DASHBOARD ? "/dashboard" : "";

  const getDefaultView = (contentType: ContentType): string => {
    if (boardView === BoardView.DASHBOARD) {
      return contentType === ContentType.REQUESTS
        ? RequestViewMode.REQUESTED
        : ContentViewMode.UPLOADED;
    }
    const tab = TAB_ITEMS.find((item) => item.value === contentType);
    return tab?.defaultView || ContentViewMode.EXPLORE;
  };

  const getTabHref = (contentType: ContentType): string => {
    const view = currentView || getDefaultView(contentType);
    const path = `${basePath}/${contentType.toLowerCase()}`;
    return `${path}?view=${view}`;
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
