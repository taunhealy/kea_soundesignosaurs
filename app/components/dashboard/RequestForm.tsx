"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { GenreCombobox } from "@/app/components/GenreCombobox";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const requestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  youtubeLink: z.string().optional(),
  genre: z.string().min(1, "Genre is required"),
  enquiryDetails: z.string().min(1, "Enquiry details are required"),
});

type RequestFormData = z.infer<typeof requestSchema>;

interface RequestFormProps {
  initialData?: RequestFormData;
  requestId?: string;
}

export function RequestForm({ initialData, requestId }: RequestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [selectedGenre, setSelectedGenre] = useState(initialData?.genre || "");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (data: RequestFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/request-threads${requestId ? `/${requestId}` : ""}`,
        {
          method: requestId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...data,
            genre: selectedGenre,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save request");
      }

      toast.success("Request saved successfully");
      router.push("/dashboard/requests");
    } catch (error) {
      console.error("Error saving request:", error);
      toast.error("Failed to save request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Title</label>
        <Input {...register("title")} />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          YouTube Reference Link (Optional)
        </label>
        <Input {...register("youtubeLink")} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Genre</label>
        <GenreCombobox
          value={selectedGenre}
          onChange={(value) => setSelectedGenre(value)}
        />
        {errors.genre && (
          <p className="text-red-500 text-sm mt-1">{errors.genre.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Enquiry Details
        </label>
        <Textarea {...register("enquiryDetails")} />
        {errors.enquiryDetails && (
          <p className="text-red-500 text-sm mt-1">
            {errors.enquiryDetails.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save Request"}
      </Button>
    </form>
  );
}
