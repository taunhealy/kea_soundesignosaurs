"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import {
  EditIcon,
  DownloadIcon,
  PlayIcon,
  PauseIcon,
  TagIcon,
  YoutubeIcon,
  MusicIcon,
  TrashIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Badge } from "../ui/badge";
import { RequestSubmission, PresetRequest } from "@/types/PresetRequestTypes";
import { useQueryClient } from "@tanstack/react-query";

interface PresetRequestCardProps {
  request: PresetRequest & {
    genre?: {
      id: string;
      name: string;
    };
  };
  showSubmissions?: boolean;
  type: "requested" | "assisted";
}

export function PresetRequestCard({
  request,
  showSubmissions = false,
  type,
}: PresetRequestCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [activeSubmission, setActiveSubmission] =
    useState<RequestSubmission | null>(null);
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const cleanupAudio = useCallback(() => {
    if (audio) {
      audio.pause();
      audio.removeEventListener("ended", () => setIsPlaying(false));
      setAudio(null);
      setIsPlaying(false);
      setActiveSubmission(null);
    }
  }, [audio]);

  useEffect(() => {
    return cleanupAudio;
  }, [cleanupAudio]);

  const togglePlay = useCallback(
    (submission: RequestSubmission) => (e: React.MouseEvent) => {
      e.stopPropagation();

      if (!submission.soundPreviewUrl) {
        toast.error("No sound preview available");
        return;
      }

      if (activeSubmission && activeSubmission.id !== submission.id) {
        cleanupAudio();
      }

      if (!audio || activeSubmission?.id !== submission.id) {
        const newAudio = new Audio(submission.soundPreviewUrl);
        newAudio.addEventListener("ended", () => setIsPlaying(false));
        newAudio.addEventListener("error", () => {
          toast.error("Failed to load audio");
          cleanupAudio();
        });
        setAudio(newAudio);
        setActiveSubmission(submission);
        newAudio.play().catch(() => {
          toast.error("Failed to play audio");
          cleanupAudio();
        });
        setIsPlaying(true);
      } else {
        if (isPlaying) {
          audio.pause();
          setIsPlaying(false);
        } else {
          audio.play().catch(() => {
            toast.error("Failed to play audio");
            cleanupAudio();
          });
          setIsPlaying(true);
        }
      }
    },
    [audio, isPlaying, cleanupAudio, activeSubmission]
  );

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this preset request?"))
      return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/presetRequest/${request.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete preset request");
      }

      toast.success("Preset request deleted successfully");

      await queryClient.invalidateQueries({
        queryKey: ["presetRequests"],
        exact: false,
      });

      router.push("/dashboard/presetRequests");
    } catch (error) {
      console.error("Error deleting preset request:", error);
      toast.error("Failed to delete preset request");
    } finally {
      setIsDeleting(false);
    }
  };

  console.log("PresetRequest Data:", {
    request,
    genre: request.genre,
    genreId: request.genreId,
  });

  return (
    <Card onClick={(e) => e.preventDefault()}>
      <CardHeader className="relative">
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/dashboard/presetRequest/edit/${request.id}`);
            }}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <EditIcon className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleDelete}
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground"
            disabled={isDeleting}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
        <CardTitle className="text-2xl">{request.title}</CardTitle>
        <CardDescription>
          Posted by {request.soundDesigner?.username || "Anonymous"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex justify-between text-sm text-muted-foreground">
            <Badge
              variant={
                request.status === "OPEN"
                  ? "default"
                  : request.status === "ASSISTED"
                  ? "secondary"
                  : "outline"
              }
            >
              {request.status}
            </Badge>
            <Badge variant="outline">
              <MusicIcon className="h-3 w-3 mr-1" />
              {request.genre?.name || "No Genre"}
            </Badge>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Enquiry Details:</h3>
            <p className="text-muted-foreground">{request.enquiryDetails}</p>
          </div>

          {request.youtubeLink && (
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <YoutubeIcon className="h-4 w-4" />
                Reference Track:
              </h3>
              <a
                href={request.youtubeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                YouTube Link
              </a>
            </div>
          )}

          {showSubmissions && (
            <div className="space-y-4">
              <h3 className="font-medium">Submissions:</h3>
              <div className="grid gap-4">
                {!request.submissions || request.submissions.length === 0 ? (
                  <div className="text-center p-4 text-muted-foreground">
                    No submissions to display.
                  </div>
                ) : (
                  request.submissions.map((submission) => (
                    <Card key={submission.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {submission.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>By: {submission.username}</span>
                            <span>
                              {new Date(
                                submission.timestamp
                              ).toLocaleDateString()}
                            </span>
                          </div>

                          {submission.soundPreviewUrl && (
                            <Button
                              onClick={togglePlay(submission)}
                              variant="outline"
                              className="w-full"
                            >
                              {isPlaying &&
                              activeSubmission?.id === submission.id ? (
                                <PauseIcon className="h-4 w-4 mr-2" />
                              ) : (
                                <PlayIcon className="h-4 w-4 mr-2" />
                              )}
                              {isPlaying &&
                              activeSubmission?.id === submission.id
                                ? "Pause Preview"
                                : "Play Preview"}
                            </Button>
                          )}

                          {submission.presetFileUrl && (
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() =>
                                window.open(submission.presetFileUrl, "_blank")
                              }
                            >
                              <DownloadIcon className="h-4 w-4 mr-2" />
                              Download Preset
                            </Button>
                          )}

                          {submission.guide && (
                            <div className="space-y-2">
                              <h4 className="font-medium">Guide:</h4>
                              <p className="text-muted-foreground">
                                {submission.guide}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
