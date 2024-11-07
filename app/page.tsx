"use client";

import { useState } from "react";
import { ContentType } from "@prisma/client";
import { ContentExplorer } from "@/app/components/ContentExplorer";
import { useSearch } from "@/contexts/SearchContext";
import { CategoryTabs } from "@/app/components/CategoryTabs";

export default function HomePage() {
  const [selectedContentType, setSelectedContentType] = useState<ContentType>(
    ContentType.PRESETS
  );
  const { filters, setFilters } = useSearch();

  const handleContentTypeChange = (newContentType: ContentType) => {
    setSelectedContentType(newContentType);
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
        <CategoryTabs
          selectedContentType={selectedContentType}
          onSelect={handleContentTypeChange}
        />
        <ContentExplorer 
          mode="explore" 
          contentType={selectedContentType} 
        />
      </div>
    </div>
  );
}
