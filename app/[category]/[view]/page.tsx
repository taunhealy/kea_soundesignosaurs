"use client";

import { ContentExplorer } from "@/app/components/ContentExplorer";
import { BoardView } from "@/types/enums";
import { ContentType } from "@prisma/client";
import { useParams, notFound } from "next/navigation";

export default function CategoryPage() {
  const params = useParams();
  const category = params?.category as string;

  // Simple category mapping
  const contentType = {
    presets: ContentType.PRESETS,
    packs: ContentType.PACKS,
    requests: ContentType.REQUESTS,
  }[category];

  if (!contentType) notFound();

  return (
    <ContentExplorer
      contentType={contentType}
      boardView={BoardView.PUBLIC}
    />
  );
}
