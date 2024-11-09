"use client";

import { ContentExplorer } from "@/app/components/ContentExplorer";
import { BoardView, ContentViewMode } from "@/types/enums";
import { ContentType } from "@prisma/client";
import { useParams, useSearchParams, notFound } from "next/navigation";

export default function DashboardCategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const category = params?.category as string;

  const contentType = {
    presets: ContentType.PRESETS,
    packs: ContentType.PACKS,
    requests: ContentType.REQUESTS,
  }[category];

  if (!contentType) notFound();

  return (
    <ContentExplorer
      contentType={contentType}
      boardView={BoardView.DASHBOARD}
    />
  );
}
