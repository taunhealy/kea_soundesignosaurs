"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";

interface HelpThread {
  id: string;
  presetTitle: string;
  youtubeLink: string;
  timestamp: string;
  genre: string;
}

export default function HelpPage() {
  const { userId } = useAuth();
  const [helpThreads, setHelpThreads] = useState<HelpThread[]>([]);

  useEffect(() => {
    const fetchHelpThreads = async () => {
      if (userId) {
        const response = await fetch(`/api/help-threads?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setHelpThreads(data);
        }
      }
    };

    fetchHelpThreads();
  }, [userId]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Help Threads</h1>
        <Link href="/dashboard/help/create">
          <Button>Create New Help Thread</Button>
        </Link>
      </div>
      {helpThreads.length === 0 ? (
        <p>You haven't created any help threads yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {helpThreads.map((thread) => (
            <Card key={thread.id}>
              <CardHeader>
                <CardTitle>{thread.presetTitle}</CardTitle>
                <CardDescription>{thread.genre}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>YouTube Link: {thread.youtubeLink}</p>
                <p>Created: {thread.timestamp}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
