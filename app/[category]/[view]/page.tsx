"use client";

import { ContentExplorer } from "@/app/components/ContentExplorer";
import { ITEM_TYPES } from "@/types/common";
import { useParams, notFound } from "next/navigation";

type CategoryParams = {
  category: string;
  view: string;
};

export default function CategoryPage() {
  const params = useParams<CategoryParams>();
  const category = params.category;

  // Simple category mapping using ITEM_TYPES
  const contentType = {
    presets: ITEM_TYPES.PRESET,
    packs: ITEM_TYPES.PACK,
    requests: ITEM_TYPES.REQUEST,
  }[category];

  if (!contentType) notFound();

  return <ContentExplorer contentType={contentType} initialFilters={{}} />;
}
