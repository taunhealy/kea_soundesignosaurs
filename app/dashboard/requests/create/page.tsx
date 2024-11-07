"use client";

import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { SubmitButton } from "@/app/components/SubmitButtons";
import { GenreCombobox } from "@/app/components/GenreCombobox";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const helpPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  youtubeLink: z.string().optional(),
  genreId: z.string().min(1, "Genre is required"),
  enquiryDetails: z.string().min(1, "Enquiry details are required"),
});

export default function HelpPostCreateRoute() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedGenre, setSelectedGenre] = useState("");

  const [form, fields] = useForm({
    shouldValidate: "onBlur",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: helpPostSchema });
    },
  });

  const mutation = useMutation({
    mutationFn: async (formData: z.infer<typeof helpPostSchema>) => {
      const response = await fetch("/api/presetRequests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create preset request");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["presetRequests"] });
      router.push("/dashboard/requests");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (mutation.isPending) return;

    const formData = new FormData(event.currentTarget);
    formData.set(fields.genreId.name, selectedGenre);

    const result = parseWithZod(formData, { schema: helpPostSchema });
    if (result.status !== "success") {
      console.error("Validation error:", result.error);
      return;
    }

    mutation.mutate({
      ...result.value,
      genreId: selectedGenre,
    });
  };

  return (
    <form onSubmit={handleSubmit} id={form.id}>
      <Card>
        <CardHeader>
          <CardTitle>Create Help Post</CardTitle>
          <CardDescription>
            Ask for help to create a specific Preset sound
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name={fields.title.name}
              defaultValue={fields.title.initialValue}
              aria-invalid={!!fields.title.errors}
            />
            {fields.title.errors && (
              <p className="text-sm text-red-500">{fields.title.errors}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="youtubeLink">
              YouTube Reference Link (Optional)
            </Label>
            <Input
              id="youtubeLink"
              name={fields.youtubeLink.name}
              defaultValue={fields.youtubeLink.initialValue}
              aria-invalid={!!fields.youtubeLink.errors}
            />
            {fields.youtubeLink.errors && (
              <p className="text-sm text-red-500">
                {fields.youtubeLink.errors}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Genre</Label>
            <input
              type="hidden"
              name={fields.genreId.name}
              value={selectedGenre}
            />
            <GenreCombobox
              value={selectedGenre}
              onChange={(value) => {
                setSelectedGenre(value);
                const formData = new FormData();
                formData.set(fields.genreId.name, value);
              }}
            />
            {fields.genreId.errors && (
              <p className="text-sm text-red-500">{fields.genreId.errors}</p>
            )}
            s
          </div>

          <div className="space-y-2">
            <Label htmlFor="enquiryDetails">Enquiry Details</Label>
            <Textarea
              id="enquiryDetails"
              name={fields.enquiryDetails.name}
              defaultValue={fields.enquiryDetails.initialValue}
              aria-invalid={!!fields.enquiryDetails.errors}
            />
            {fields.enquiryDetails.errors && (
              <p className="text-sm text-red-500">
                {fields.enquiryDetails.errors}
              </p>
            )}
          </div>
        </CardContent>
        <CardContent>
          <SubmitButton>Create Help Post</SubmitButton>
        </CardContent>
      </Card>
    </form>
  );
}
