"use client";

import { useEffect, useState } from "react";
import { Sample, Preset } from "@/types/SamplePresetTypes";

interface MyDownloadsProps {
  activeTab: "samples" | "presets";
  userId: string;
}

export function MyDownloads({ activeTab, userId }: MyDownloadsProps) {
  const [downloads, setDownloads] = useState<(Sample | Preset)[]>([]);

  useEffect(() => {
    // Fetch downloads based on activeTab and userId
    const fetchDownloads = async () => {
      const response = await fetch(`/api/downloads?type=${activeTab}&userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setDownloads(data);
      }
    };

    fetchDownloads();
  }, [activeTab, userId]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">My {activeTab === "samples" ? "Samples" : "Presets"}</h2>
      <ul className="space-y-4">
        {downloads.map((item) => (
          <li key={item.id} className="border p-4 rounded">
            <h3 className="font-medium">{item.title}</h3>
            <p>{item.description}</p>
            <p>Price: ${item.price}</p>
            {/* Add more details as needed */}
          </li>
        ))}
      </ul>
    </div>
  );
}

