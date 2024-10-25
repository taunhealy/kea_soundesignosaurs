"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { UploadDropzone } from "@/lib/uploadthing";
import { createPreset, updatePreset } from "@/app/actions/presetActions";

const presetSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().positive("Price must be positive"),
  fxGuide: z.string().min(1, "FX Guide is required"),
  spotifyLink: z.string().url().optional(),
  genreId: z.string(),
  vstId: z.string(),
  soundPreviewUrl: z.string().optional(),
  downloadUrl: z.string().optional(),
});

type PresetFormData = z.infer<typeof presetSchema>;

interface PresetFormProps {
  initialData?: PresetFormData;
  presetId?: string;
}

export function PresetForm({ initialData, presetId }: PresetFormProps) {
  const [soundPreviewUrl, setSoundPreviewUrl] = useState(
    initialData?.soundPreviewUrl || ""
  );
  const [downloadUrl, setDownloadUrl] = useState(
    initialData?.downloadUrl || ""
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PresetFormData>({
    resolver: zodResolver(presetSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (data: PresetFormData) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });
    formData.append("soundPreviewUrl", soundPreviewUrl);
    formData.append("downloadUrl", downloadUrl);

    if (presetId) {
      await updatePreset(presetId, formData);
    } else {
      await createPreset(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input {...register("title")} placeholder="Title" />
      {errors.title && <p className="text-red-500">{errors.title.message}</p>}

      <Textarea {...register("description")} placeholder="Description" />
      {errors.description && (
        <p className="text-red-500">{errors.description.message}</p>
      )}

      <Input
        {...register("price", { valueAsNumber: true })}
        type="number"
        step="0.01"
        placeholder="Price"
      />
      {errors.price && <p className="text-red-500">{errors.price.message}</p>}

      <Textarea {...register("fxGuide")} placeholder="FX Guide" />
      {errors.fxGuide && (
        <p className="text-red-500">{errors.fxGuide.message}</p>
      )}

      <Input
        {...register("spotifyLink")}
        placeholder="Spotify Link (optional)"
      />
      {errors.spotifyLink && (
        <p className="text-red-500">{errors.spotifyLink.message}</p>
      )}

      <Input {...register("genreId")} placeholder="Genre ID" />
      {errors.genreId && (
        <p className="text-red-500">{errors.genreId.message}</p>
      )}

      <Input {...register("vstId")} placeholder="VST ID" />
      {errors.vstId && <p className="text-red-500">{errors.vstId.message}</p>}

      <div>
        <label>Sound Preview</label>
        <UploadDropzone
          endpoint="presetUploader"
          onClientUploadComplete={(res) => {
            setSoundPreviewUrl(res?.[0]?.url || "");
          }}
          onUploadError={(error: Error) => {
            console.error(error);
          }}
        />
      </div>

      <div>
        <label>Preset File</label>
        <UploadDropzone
          endpoint="presetUploader"
          onClientUploadComplete={(res) => {
            setDownloadUrl(res?.[0]?.url || "");
          }}
          onUploadError={(error: Error) => {
            console.error(error);
          }}
        />
      </div>

      <Button type="submit">
        {presetId ? "Update Preset" : "Create Preset"}
      </Button>
    </form>
  );
}
