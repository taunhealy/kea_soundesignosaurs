"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { EditIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface RequestSubmission {
  id: string;
  userId: string;
  username: string;
  title: string;
  soundPreviewUrl?: string;
  presetFileUrl?: string;
  guide?: string;
  timestamp: string;
}

interface RequestCardProps {
  request: {
    id: string;
    userId: string;
    title: string;
    youtubeLink: string;
    timestamp: string;
    genre: string;
    status: "OPEN" | "ASSISTED" | "SATISFIED";
    username: string;
    submissions?: RequestSubmission[];
  };
  type: "requested" | "assisted";
}

export function RequestCard({ request, type }: RequestCardProps) {
  const router = useRouter();

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking the edit button
    if ((e.target as HTMLElement).closest('.edit-button')) {
      e.stopPropagation();
      return;
    }
    router.push(`/requests/${request.id}`);
  };

  return (
    <Card 
      className="cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={handleCardClick}
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{request.title}</CardTitle>
          <CardDescription>Posted by {request.username}</CardDescription>
        </div>
        <Link 
          href={`/dashboard/requests/${request.id}/edit`}
          className="edit-button"
        >
          <Button variant="ghost" size="icon">
            <EditIcon className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Status: {request.status}</span>
          <span>Genre: {request.genre}</span>
        </div>
      </CardContent>
    </Card>
  );
}
