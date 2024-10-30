"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";
import { PresetRequestCard } from "@/app/components/dashboard/PresetRequestCard";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { SubmitButton } from "@/app/components/SubmitButtons";
import { GenreCombobox } from "@/app/components/GenreCombobox";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { PlayIcon, PauseIcon, UserIcon, ExternalLinkIcon } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import Link from "next/link";
import Image from "next/image";

const presetRequestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  youtubeLink: z.string().optional(),
  genreId: z.string().min(1, "Genre is required"),
  enquiryDetails: z.string().min(1, "Enquiry details are required"),
});

interface PresetRequestFormData {
  id: string;
  userId: string;
  title: string;
  youtubeLink: string;
  genre: {
    id: string;
    name: string;
  };
  genreId: string;
  enquiryDetails: string;
  status: "OPEN" | "ASSISTED" | "SATISFIED";
  timestamp: string;
  soundPreviewUrl?: string;
  soundDesigner: {
    username: string;
  };
}

interface PageProps {
  params: {
    id: string;
  };
}

export default function EditPresetRequestPage({ params }: PageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedGenre, setSelectedGenre] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [youtubeThumb, setYoutubeThumb] = useState<string | null>(null);

  const { data: initialData, isLoading } = useQuery<PresetRequestFormData>({
    queryKey: ["presetRequest", params.id],
    queryFn: async () => {
      const response = await fetch(`/api/presetRequest/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch preset request");
      const data = await response.json();

      if (data.youtubeLink) {
        const videoId = extractYoutubeId(data.youtubeLink);
        if (videoId) {
          setYoutubeThumb(
            `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
          );
        }
      }

      setSelectedGenre(data.genre?.id || data.genreId);

      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const requestBody = {
        title: formData.get("title"),
        youtubeLink: formData.get("youtubeLink") || null,
        genreId: selectedGenre,
        enquiryDetails: formData.get("enquiryDetails"),
      };

      console.log("Sending update request with:", requestBody);

      const response = await fetch(`/api/presetRequest/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update preset request");
      }
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Update successful:", data);
      queryClient.invalidateQueries({
        queryKey: ["presetRequests"],
        exact: false,
      });
      router.push("/dashboard/presetRequests");
      toast.success("Preset request updated successfully");
    },
    onError: (error) => {
      console.error("Update failed:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update preset request"
      );
    },
  });

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    formData.set("genreId", selectedGenre);

    if (!selectedGenre) {
      toast.error("Please select a genre");
      return;
    }

    mutation.mutate(formData);
  };

  const cleanupAudio = useCallback(() => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setAudio(null);
    }
    setIsPlaying(false);
  }, [audio]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      cleanupAudio();
    } else if (initialData?.soundPreviewUrl) {
      cleanupAudio();
      const newAudio = new Audio(initialData.soundPreviewUrl);
      newAudio.addEventListener("ended", () => setIsPlaying(false));
      newAudio.play();
      setAudio(newAudio);
      setIsPlaying(true);
    }
  }, [isPlaying, initialData?.soundPreviewUrl, cleanupAudio]);

  if (isLoading || !initialData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <PresetRequestCard request={initialData} type="requested" />

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            defaultValue={initialData.title}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="youtubeLink">YouTube Reference (Optional)</Label>
          <Input
            id="youtubeLink"
            name="youtubeLink"
            defaultValue={initialData.youtubeLink}
          />
        </div>

        <div className="space-y-2">
          <Label>Genre</Label>
          <GenreCombobox value={selectedGenre} onChange={setSelectedGenre} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="enquiryDetails">Enquiry Details</Label>
          <Textarea
            id="enquiryDetails"
            name="enquiryDetails"
            defaultValue={initialData.enquiryDetails}
            required
          />
        </div>

        <SubmitButton isSubmitting={mutation.isPending} />
      </form>

      {initialData.soundPreviewUrl && (
        <div className="mt-4">
          <Button onClick={togglePlay} variant="outline" className="w-full">
            {isPlaying ? (
              <PauseIcon className="mr-2 h-4 w-4" />
            ) : (
              <PlayIcon className="mr-2 h-4 w-4" />
            )}
            {isPlaying ? "Pause Preview" : "Play Preview"}
          </Button>
        </div>
      )}
    </div>
  );
}

function extractYoutubeId(url: string): string | null {
  const regex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}
