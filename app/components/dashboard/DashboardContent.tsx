"use client";

import { useState } from "react";
import { MyDownloads } from "./MyDownloads";
import { UploadDropdown } from "./UploadDropdown";

interface DashboardContentProps {
  userId: string;
}

export function DashboardContent({ userId }: DashboardContentProps) {
  const [activeTab, setActiveTab] = useState<"samples" | "presets">("samples");

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="space-x-4">
          <button
            onClick={() => setActiveTab("samples")}
            className={`px-4 py-2 rounded ${
              activeTab === "samples" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Samples
          </button>
          <button
            onClick={() => setActiveTab("presets")}
            className={`px-4 py-2 rounded ${
              activeTab === "presets" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Presets
          </button>
        </div>
        <UploadDropdown />
      </div>
      <MyDownloads activeTab={activeTab} userId={userId} />
    </div>
  );
}

