"use client";

import { PresetGrid } from "@/app/components/shared/PresetGrid";
import { SearchSidebar } from "@/app/components/SearchSidebar";
import { PresetPackGrid } from "@/app/components/shared/PresetPackGrid";
import { PresetRequestGrid } from "@/app/components/shared/PresetRequestGrid";
import { ItemType, RequestStatus } from "@prisma/client";
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
import { useSession } from "next-auth/react";

interface ContentExplorerProps {
  itemType: ItemType;
  initialFilters: SearchFilters;
  status?: string;
}

export function ContentExplorer({
  itemType,
  initialFilters,
}: ContentExplorerProps) {
  console.log("[DEBUG] ContentExplorer - Initial itemType:", itemType);

  const { data, isLoading } = useContent({
    itemType: itemType,
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

  const [state, setState] = useState<{
    activeTab: ContentViewMode | RequestViewMode;
    viewMode: string;
    status: string;
  }>(() => {
    const initialState = getInitialState(itemType, view);
    return initialState;
  });

  const renderRequestTabs = () => {
    const { status } = useSession();
    const isAuthenticated = status === "authenticated";

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
            {isAuthenticated && (
              <TabsTrigger value={RequestViewMode.REQUESTED}>
                My Requests
              </TabsTrigger>
            )}
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
            <TabsTrigger value={RequestStatus.OPEN}>Open</TabsTrigger>
            <TabsTrigger value={RequestStatus.SATISFIED}>Satisfied</TabsTrigger>
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
    const { status } = useSession();
    const isAuthenticated = status === "authenticated";

    return (
      <div className="space-y-4">
        {isAuthenticated && (
          <Tabs defaultValue={state.viewMode}>
            <TabsList className="mb-4">
              <TabsTrigger value={ContentViewMode.EXPLORE}>All</TabsTrigger>
              <TabsTrigger value={ContentViewMode.UPLOADED}>
                My Uploads
              </TabsTrigger>
              <TabsTrigger value={ContentViewMode.DOWNLOADED}>
                Downloaded
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
        {renderContentGrid()}
      </div>
    );
  };

  const renderContentGrid = () => {
    if (itemType === ItemType.PRESET) {
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
    if (itemType === ItemType.REQUEST) {
      return renderRequestTabs();
    }
    return renderContentTabs();
  };

  const renderCreateButton = () => {
    switch (itemType) {
      case ItemType.PRESET:
        return <CreatePresetButton />;
      case ItemType.PACK:
        return <CreatePackButton />;
      case ItemType.REQUEST:
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
            itemType={itemType}
          />
        </aside>
        <main className="flex-1 min-w-[640px]">
          <CategoryTabs
            selectedItemType={itemType}
            onSelect={(type) => {
              // Let CategoryTabs handle the routing
              // Remove any duplicate routing logic here
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

const getRoutePrefix = (itemType: ItemType) => {
  console.log("[DEBUG] Tab clicked with itemType:", itemType);
  return `${itemType.toLowerCase()}s`;
};

const getInitialState = (
  itemType: ItemType,
  viewParam: string | null
): {
  activeTab: ContentViewMode | RequestViewMode;
  viewMode: string;
  status: string;
} => {
  const view = viewParam || "";

  if (itemType === ItemType.REQUEST) {
    return {
      activeTab: RequestViewMode.PUBLIC,
      viewMode: RequestViewMode.PUBLIC,
      status: RequestStatus.OPEN,
    };
  }

  return {
    activeTab: ContentViewMode.EXPLORE,
    viewMode: ContentViewMode.EXPLORE,
    status: RequestStatus.OPEN,
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
