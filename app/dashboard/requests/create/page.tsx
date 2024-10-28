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

const helpPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  youtubeLink: z.string().optional(),
  genre: z.string().min(1, "Genre is required"),
  enquiryDetails: z.string().min(1, "Enquiry details are required"),
});

export default function HelpPostCreateRoute() {
  const router = useRouter();
  const [selectedGenre, setSelectedGenre] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, fields] = useForm({
    shouldValidate: "onBlur",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: helpPostSchema });
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      const formData = new FormData(event.currentTarget);
      formData.set(fields.genre.name, selectedGenre);

      const result = parseWithZod(formData, { schema: helpPostSchema });
      if (result.status !== "success") {
        console.error("Validation error:", result.error);
        return;
      }

      const response = await fetch("/api/request-threads", {
        method: "POST",
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
        throw new Error(error.message || "Failed to create help thread");
      }

      // Change this line to redirect to /dashboard/requests instead of /dashboard/help
      router.push("/dashboard/requests");
    } catch (error) {
      console.error("Error creating request thread:", error);
      // Here you could add toast notification or error message display
    } finally {
      setIsSubmitting(false);
    }
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
              name={fields.genre.name}
              value={selectedGenre}
            />
            <GenreCombobox
              value={selectedGenre}
              onChange={(value) => {
                console.log("Genre selected:", value);
                setSelectedGenre(value);

                // Create a new FormData instance and convert it to a plain object
                const formData = new FormData(
                  document.getElementById(form.id) as HTMLFormElement
                );
                formData.set(fields.genre.name, value);

                // Convert FormData to a plain object before validation
                const formDataObj = Object.fromEntries(formData);
                form.validate(formDataObj);
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
          <SubmitButton text="Create Help Post" />
        </CardContent>
      </Card>
    </form>
  );
}
