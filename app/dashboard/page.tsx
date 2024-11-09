"use client";

import { ContentExplorer } from "../components/ContentExplorer";
import { BoardView } from "@/types/enums";
import { ContentType } from "@prisma/client";
import { redirect } from "next/navigation";

export default function DashboardPage() {
  // Redirect to the default dashboard/presets route
  redirect("/dashboard/presets");
}
