"use client";

import { useState, useRouter } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { PlayIcon, PauseIcon, EditIcon } from "lucide-react";
import Link from "next/link";
import { useRouter as useRouterNext } from "next/navigation";

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const router = useRouterNext();

  const handlePreviewSound = (url?: string) => {
    if (!url) return;

    if (!audio) {
      const newAudio = new Audio(url);
      setAudio(newAudio);
      newAudio.play();
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on buttons or links
    if ((e.target as HTMLElement).closest('button, a')) {
      return;
    }
    router.push(`/requests/${request.id}`);
  };

  const handleUserClick = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    router.push(`/profile/${userId}`);
  };

  return (
    <Card className="relative cursor-pointer hover:shadow-md transition-shadow" onClick={handleCardClick}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl">{request.title}</CardTitle>
              <button 
                onClick={(e) => handleUserClick(e, request.userId)}
                className="text-sm text-primary hover:underline"
              >
                by {request.username}
              </button>
            </div>
            <div>
              <span className="inline-block bg-secondary px-2 py-1 rounded-md text-sm mr-2">
                {request.genre}
              </span>
              <span className="inline-block bg-secondary px-2 py-1 rounded-md text-sm">
                {request.status}
              </span>
            </div>
          </div>
          {type === "requested" && (
            <Button
              variant="outline"
              size="icon"
              className="absolute top-4 right-4"
              asChild
            >
              <Link href={`/dashboard/requests/${request.id}/edit`}>
                <EditIcon className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={request.youtubeLink} target="_blank">
                🎵 Reference Track
              </Link>
            </Button>
            <span className="text-sm text-muted-foreground">
              Created: {new Date(request.timestamp).toLocaleDateString()}
            </span>
          </div>

          {request.submissions && request.submissions.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground">
                Submissions ({request.submissions.length})
              </h4>
              {request.submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="bg-secondary/50 rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{submission.username}</span>
                    <span className="text-sm text-muted-foreground">
                        {submission.id}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {submission.soundPreviewUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handlePreviewSound(submission.soundPreviewUrl)
                        }
                      >
                        {isPlaying ? (
                          <PauseIcon className="h-4 w-4 mr-2" />
                        ) : (
                          <PlayIcon className="h-4 w-4 mr-2" />
                        )}
                        Preview
                      </Button>
                    )}
                    {submission.presetFileUrl && (
                      <Button size="sm" variant="outline" asChild>
                        <Link href={submission.presetFileUrl}>⬇️ Download</Link>
                      </Button>
                    )}
                    {submission.guide && (
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/presets/${submission.guide}`}>
                          📖 Guide
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {request.status === "OPEN" && type === "requested" && (
            <p className="text-yellow-600 text-sm">Waiting for submissions</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
