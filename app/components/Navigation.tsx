"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { ContentType } from "@prisma/client";
import { BoardView, ContentViewMode, RequestViewMode } from "@/types/enums";

interface NavigationProps {
  selectedContentType: ContentType;
  boardView: BoardView;
  onTabChange: (value: string) => void;
}

export function Navigation({
  selectedContentType,
  boardView,
  onTabChange,
}: NavigationProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Default view based on board mode
  const currentView =
    searchParams?.get("view") ||
    (boardView === BoardView.DASHBOARD ? "uploaded" : "explore");

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams);

    if (boardView === BoardView.DASHBOARD) {
      // Change this to match the public URL structure
      // Instead of: /dashboard?category=packs&view=uploaded
      // Use: /dashboard/packs?view=uploaded
      router.push(`/dashboard/${category.toLowerCase()}?${params.toString()}`);
    } else {
      // Public mode: /packs?view=explore
      router.push(`/${category.toLowerCase()}?${params.toString()}`);
    }
  };

  const renderViewTabs = () => {
    // Public mode: only show Explore tab
    if (boardView === BoardView.PUBLIC) {
      return <TabsTrigger value={ContentViewMode.EXPLORE}>Explore</TabsTrigger>;
    }

    // Dashboard mode: show different tabs based on content type
    if (selectedContentType === ContentType.REQUESTS) {
      return (
        <>
          <TabsTrigger value={RequestViewMode.REQUESTED}>Requested</TabsTrigger>
          <TabsTrigger value={RequestViewMode.ASSISTED}>Assisted</TabsTrigger>
          <TabsTrigger value={RequestViewMode.PUBLIC}>Public</TabsTrigger>
        </>
      );
    }

    // Dashboard mode: default tabs for Presets and Packs
    return (
      <>
        <TabsTrigger value={ContentViewMode.UPLOADED}>Uploaded</TabsTrigger>
        <TabsTrigger value={ContentViewMode.DOWNLOADED}>Downloaded</TabsTrigger>
      </>
    );
  };

  return (
    <div className="space-y-4">
      {/* Category Navigation - adapts URLs based on boardView */}
      <Tabs
        value={selectedContentType.toLowerCase()}
        onValueChange={handleCategoryChange}
      >
        <TabsList>
          <TabsTrigger value="presets">Presets</TabsTrigger>
          <TabsTrigger value="packs">Packs</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* View Mode Navigation - shows different tabs based on boardView */}
      <Tabs value={currentView} onValueChange={onTabChange}>
        <TabsList>{renderViewTabs()}</TabsList>
      </Tabs>
    </div>
  );
}
