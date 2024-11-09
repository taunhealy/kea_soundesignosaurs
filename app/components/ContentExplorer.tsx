"use client";

import { PresetGrid } from "@/app/components/shared/PresetGrid";
import { SearchSidebar } from "@/app/components/SearchSidebar";
import { PresetPackGrid } from "@/app/components/shared/PresetPackGrid";
import { PresetRequestGrid } from "@/app/components/shared/PresetRequestGrid";
import { ContentType, RequestStatus } from "@prisma/client";
import {
  ContentViewMode,
  isContentViewMode,
  isRequestViewMode,
  RequestViewMode,
} from "@/types/enums";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ContentExplorerTabState } from "@/types/props";
import { BoardView } from "@/types/enums";
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
  boardView: BoardView;
  initialFilters: SearchFilters;
  status?: string;
}

export function ContentExplorer({
  contentType,
  boardView,
  initialFilters,
  status,
}: ContentExplorerProps) {
  const { filters, updateFilters } = useSearchState();
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get("view");

  const [state, setState] = useState<
    Omit<ContentExplorerTabState, "contentType">
  >(() => {
    const initialState = getInitialState(boardView, contentType, view);
    return {
      activeTab: initialState.activeTab,
      viewMode: initialState.viewMode,
      status: initialState.status,
    };
  });

  const { items, isLoading } = useContent({
    contentType,
    boardView,
    filters,
    view: state.viewMode,
    status: state.status,
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
            router.push(`${getBasePath()}/requests?${params.toString()}`);
          }}
        >
          <TabsList className="mb-4">
            <TabsTrigger value={RequestViewMode.PUBLIC}>All</TabsTrigger>
            <TabsTrigger value={RequestViewMode.REQUESTED}>
              My Requests
            </TabsTrigger>
            <TabsTrigger value={RequestViewMode.ASSISTED}>
              Assisting
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
            router.push(`${getBasePath()}/requests?${params.toString()}`);
          }}
        >
          <TabsList className="mb-4">
            <TabsTrigger value={RequestStatus.OPEN}>Open</TabsTrigger>
            <TabsTrigger value={RequestStatus.COMPLETED}>Completed</TabsTrigger>
          </TabsList>
        </Tabs>

        <PresetRequestGrid
          requests={filterRequests(items, state.viewMode)}
          requestStatus={state.status as RequestStatus}
          requestViewMode={state.viewMode as RequestViewMode}
          isLoading={isLoading}
        />
      </div>
    );
  };

  const filterRequests = (requests: any[], viewMode: string) => {
    if (!requests) return [];
    return requests.filter(
      (req) => viewMode === RequestViewMode.PUBLIC || req.viewMode === viewMode
    );
  };

  const renderContentTabs = () => {
    return (
      <div className="space-y-4">
        <Tabs
          defaultValue={state.viewMode}
          onValueChange={(value) => {
            setState((prev) => ({ ...prev, viewMode: value }));
            const params = new URLSearchParams(searchParams);
            params.set("view", value);
            router.push(
              `${getBasePath()}/${contentType.toLowerCase()}?${params.toString()}`
            );
          }}
        >
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

        {contentType === ContentType.PRESETS ? (
          <PresetGrid
            presets={items}
            contentViewMode={state.viewMode as ContentViewMode}
            isLoading={isLoading}
          />
        ) : (
          <PresetPackGrid
            packs={items}
            contentViewMode={state.viewMode as ContentViewMode}
            isLoading={isLoading}
          />
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (contentType === ContentType.REQUESTS) {
      return renderRequestTabs();
    }
    return renderContentTabs();
  };

  const getBasePath = () =>
    boardView === BoardView.DASHBOARD ? "/dashboard" : "";

  const renderCreateButton = () => {
    switch (contentType) {
      case ContentType.PRESETS:
        return <CreatePresetButton />;
      case ContentType.PACKS:
        return <CreatePackButton />;
      case ContentType.REQUESTS:
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
            boardView={boardView}
          />
        </aside>
        <main className="flex-1 min-w-[640px]">
          <CategoryTabs
            selectedContentType={contentType}
            onSelect={(type) => {
              const params = new URLSearchParams(searchParams);
              const defaultView =
                boardView === BoardView.DASHBOARD
                  ? ContentViewMode.UPLOADED
                  : ContentViewMode.EXPLORE;
              router.push(
                `${getBasePath()}/${type.toLowerCase()}?view=${defaultView}`
              );
            }}
            boardView={boardView}
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
  boardView: BoardView,
  contentType: ContentType,
  viewParam: string | null
): Omit<ContentExplorerTabState, "contentType"> => {
  const view = viewParam || "";

  if (contentType === ContentType.REQUESTS) {
    return {
      activeTab: isRequestViewMode(view)
        ? (view as RequestViewMode)
        : RequestViewMode.PUBLIC,
      viewMode: isRequestViewMode(view)
        ? (view as RequestViewMode)
        : RequestViewMode.PUBLIC,
      status: RequestStatus.OPEN,
    };
  }

  return {
    activeTab: isContentViewMode(view)
      ? (view as ContentViewMode)
      : ContentViewMode.EXPLORE,
    viewMode: isContentViewMode(view)
      ? (view as ContentViewMode)
      : ContentViewMode.EXPLORE,
    status: RequestStatus.OPEN,
  };
};
