"use client";

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
  genre: z.string().min(1, "Genre is required"),
  enquiryDetails: z.string().min(1, "Enquiry details are required"),
});

interface PresetRequestFormData {
  id: string;
  userId: string;
  title: string;
  youtubeLink: string;
  genre: string;
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
  const [selectedGenre, setSelectedGenre] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<PresetRequestFormData | null>(
    null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [youtubeThumb, setYoutubeThumb] = useState<string | null>(null);

  // Audio cleanup function (similar to PresetCard.tsx)
  const cleanupAudio = useCallback(() => {
    if (audio) {
      audio.pause();
      audio.removeEventListener("ended", () => setIsPlaying(false));
      setAudio(null);
      setIsPlaying(false);
    }
  }, [audio]);

  useEffect(() => {
    return cleanupAudio;
  }, [cleanupAudio]);

  // Fetch initial data
  useEffect(() => {
    const fetchPresetRequest = async () => {
      try {
        const response = await fetch(`/api/presetRequest/${params.id}`);
        if (!response.ok) throw new Error("Failed to fetch preset request");
        const data = await response.json();

        // Extract YouTube thumbnail if link exists
        if (data.youtubeLink) {
          const videoId = extractYoutubeId(data.youtubeLink);
          if (videoId) {
            setYoutubeThumb(
              `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
            );
          }
        }

        setInitialData(data);
        setSelectedGenre(data.genre);
      } catch (error) {
        console.error("Error fetching preset request:", error);
        toast.error("Failed to load preset request");
        router.push("/dashboard/presetRequests");
      }
    };

    fetchPresetRequest();
  }, [params.id, router]);

  const [form, fields] = useForm({
    shouldValidate: "onBlur",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: presetRequestSchema });
    },
    defaultValue: initialData,
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const formData = new FormData(event.currentTarget);
      formData.set(fields.genre.name, selectedGenre);

      const result = parseWithZod(formData, { schema: presetRequestSchema });
      if (result.status !== "success") {
        console.error("Validation error:", result.error);
        return;
      }

      const response = await fetch(`/api/presetRequest/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...result.value,
          genre: selectedGenre,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update preset request");
      }

      router.push("/dashboard/presetRequests");
      toast.success("Preset request updated successfully");
    } catch (error) {
      console.error("Error updating preset request:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (!initialData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <PresetRequestCard request={initialData} type="requested" />

      <form id={form.id} onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name={fields.title.name}
            defaultValue={initialData.title}
            aria-invalid={!!fields.title.errors}
          />
          {fields.title.errors && (
            <p className="text-sm text-red-500">{fields.title.errors}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="youtubeLink">YouTube Reference (Optional)</Label>
          <Input
            id="youtubeLink"
            name={fields.youtubeLink.name}
            defaultValue={initialData.youtubeLink}
          />
        </div>

        <div className="space-y-2">
          <Label>Genre</Label>
          <input type="hidden" name={fields.genre.name} value={selectedGenre} />
          <GenreCombobox
            value={selectedGenre}
            onChange={(value) => {
              setSelectedGenre(value);
            }}
          />
          {fields.genre.errors && (
            <p className="text-sm text-red-500">{fields.genre.errors}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="enquiryDetails">Enquiry Details</Label>
          <Textarea
            id="enquiryDetails"
            name={fields.enquiryDetails.name}
            defaultValue={initialData.enquiryDetails}
            aria-invalid={!!fields.enquiryDetails.errors}
          />
          {fields.enquiryDetails.errors && (
            <p className="text-sm text-red-500">
              {fields.enquiryDetails.errors}
            </p>
          )}
        </div>

        <SubmitButton isSubmitting={isSubmitting} />
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
