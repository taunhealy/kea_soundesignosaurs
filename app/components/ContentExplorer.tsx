"use client";

import { PresetGrid } from "@/app/components/shared/PresetGrid";
import { SearchSidebar } from "@/app/components/SearchSidebar";
import { PresetPackGrid } from "@/app/components/shared/PresetPackGrid";
import { PresetRequestGrid } from "@/app/components/shared/PresetRequestGrid";
import { ITEM_TYPES, ContentType } from "@/types/common";
import {
  ContentViewMode,
  isContentViewMode,
  isRequestViewMode,
  RequestViewMode,
} from "@/types/enums";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ContentExplorerTabState } from "@/types/props";
import { useSearchState } from "@/app/hooks/useSearchState";
import { useContent } from "@/app/hooks/queries/useContent";
import { SearchFilters } from "@/types/SearchTypes";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { CategoryTabs } from "@/app/components/CategoryTabs";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { CreatePresetButton } from "@/app/components/buttons/CreatePresetButton";
import { CreatePackButton } from "@/app/components/buttons/CreatePackButton";
import { CreateRequestButton } from "@/app/components/buttons/CreateRequestButton";

interface ContentExplorerProps {
  contentType: ContentType;
  initialFilters: SearchFilters;
  status?: string;
}

export function ContentExplorer({
  contentType,
  initialFilters,
}: ContentExplorerProps) {
  const { data, isLoading } = useContent({
    contentType,
    filters: initialFilters,
    view: initialFilters.view,
    status: initialFilters.status,
  });

  const items = data || [];

  console.log("[DEBUG] ContentExplorer view:", initialFilters.view);
  console.log("[DEBUG] ContentExplorer items count:", items.length);
  console.log("[DEBUG] ContentExplorer items:", items);

  const { filters, updateFilters } = useSearchState();
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get("view");

  const [state, setState] = useState<
    Omit<ContentExplorerTabState, "contentType">
  >(() => {
    const initialState = getInitialState(contentType, view);
    return {
      activeTab: initialState.activeTab,
      viewMode: initialState.viewMode,
      status: initialState.status,
    };
  });

  const renderRequestTabs = () => {
    return (
      <div className="space-y-4">
        <Tabs
          defaultValue={state.viewMode}
          onValueChange={(value) => {
            setState((prev) => ({ ...prev, viewMode: value }));
            const params = new URLSearchParams(searchParams);
            params.set("view", value);
            router.push(`/requests?${params.toString()}`);
          }}
        >
          <TabsList className="mb-4">
            <TabsTrigger value={RequestViewMode.PUBLIC}>All</TabsTrigger>
            <TabsTrigger value={RequestViewMode.REQUESTED}>
              My Requests
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs
          defaultValue={state.status}
          onValueChange={(value) => {
            setState((prev) => ({ ...prev, status: value }));
            const params = new URLSearchParams(searchParams);
            const currentView = params.get("view") || state.viewMode;
            params.set("view", currentView);
            params.set("status", value);
            router.push(`/requests?${params.toString()}`);
          }}
        >
          <TabsList className="mb-4">
            <TabsTrigger value={PrismaRequestStatus.OPEN}>Open</TabsTrigger>
            <TabsTrigger value={PrismaRequestStatus.SATISFIED}>
              Satisfied
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <PresetRequestGrid
          requests={items}
          requestViewMode={state.viewMode as RequestViewMode}
          isLoading={isLoading}
        />
      </div>
    );
  };

  const renderContentTabs = () => {
    return (
      <div className="space-y-4">
        <Tabs
          defaultValue={state.viewMode}
          onValueChange={(value) => {
            setState((prev) => ({ ...prev, viewMode: value }));
            const params = new URLSearchParams();
            params.set("view", value);
            router.push(`/${contentType.toLowerCase()}?${params.toString()}`);
          }}
        >
          <TabsList className="mb-4">
            <TabsTrigger value={ContentViewMode.EXPLORE}>All</TabsTrigger>
            <TabsTrigger value={ContentViewMode.UPLOADED}>My Uploads</TabsTrigger>
            <TabsTrigger value={ContentViewMode.DOWNLOADED}>Downloaded</TabsTrigger>
          </TabsList>
        </Tabs>

        {renderContentGrid()}
      </div>
    );
  };

  const renderContentGrid = () => {
    if (contentType === ITEM_TYPES.PRESET) {
      return (
        <PresetGrid
          presets={items}
          contentViewMode={state.viewMode as ContentViewMode}
          isLoading={isLoading}
        />
      );
    }
    return (
      <PresetPackGrid
        packs={items}
        contentViewMode={state.viewMode as ContentViewMode}
        isLoading={isLoading}
      />
    );
  };

  const renderContent = () => {
    if (contentType === ITEM_TYPES.REQUEST) {
      return renderRequestTabs();
    }
    return renderContentTabs();
  };

  const renderCreateButton = () => {
    switch (contentType) {
      case ITEM_TYPES.PRESET:
        return <CreatePresetButton />;
      case ITEM_TYPES.PACK:
        return <CreatePackButton />;
      case ITEM_TYPES.REQUEST:
        return <CreateRequestButton />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-w-[1024px]">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 min-w-[256px] space-y-6">
          <SearchSidebar
            filters={filters}
            updateFilters={updateFilters}
            contentType={contentType}
          />
        </aside>
        <main className="flex-1 min-w-[640px]">
          <CategoryTabs
            selectedContentType={contentType}
            onSelect={(type) => {
              const params = new URLSearchParams(searchParams);
              const defaultView = ContentViewMode.UPLOADED;
              router.push(`/${type.toLowerCase()}?view=${defaultView}`);
            }}
          />
          <div className="flex justify-between items-center mb-6">
            <div className="flex justify-between items-center w-full">
              <div />
              {renderCreateButton()}
            </div>
          </div>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

const getInitialState = (
  contentType: ContentType,
  viewParam: string | null
): Omit<ContentExplorerTabState, "contentType"> => {
  const view = viewParam || "";

  if (contentType === ITEM_TYPES.REQUEST) {
    return {
      activeTab: isRequestViewMode(view)
        ? (view as RequestViewMode)
        : RequestViewMode.PUBLIC,
      viewMode: isRequestViewMode(view)
        ? (view as RequestViewMode)
        : RequestViewMode.PUBLIC,
      status: PrismaRequestStatus.OPEN,
    };
  }

  return {
    activeTab: isContentViewMode(view)
      ? (view as ContentViewMode)
      : ContentViewMode.EXPLORE,
    viewMode: isContentViewMode(view)
      ? (view as ContentViewMode)
      : ContentViewMode.EXPLORE,
    status: PrismaRequestStatus.OPEN,
  };
};

const filterRequests = (
  requests: any[],
  currentUserId: string,
  viewMode: string
) => {
  if (!requests) return [];
  return requests;
};
