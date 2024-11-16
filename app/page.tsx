"use client";

import { ContentExplorer } from "@/app/components/ContentExplorer";
import { ItemType } from "@prisma/client";

export default function HomePage() {
  return <ContentExplorer itemType={ItemType.PRESET} initialFilters={{}} />;
}
