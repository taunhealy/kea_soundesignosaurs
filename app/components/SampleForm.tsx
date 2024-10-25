"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { UploadDropzone } from "@/lib/uploadthing";
import { createSample, updateSample } from "@/app/actions/sampleActions";

const sampleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().positive("Price must be positive"),
  genreId: z.string(),
  soundPreviewUrl: z.string().optional(),
  downloadUrl: z.string().optional(),
});

type SampleFormData = z.infer<typeof sampleSchema>;

interface SampleFormProps {
  initialData?: SampleFormData;
  sampleId?: string;
}

export function SampleForm({ initialData, sampleId }: SampleFormProps) {
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
  } = useForm<SampleFormData>({
    resolver: zodResolver(sampleSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (data: SampleFormData) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });
    formData.append("soundPreviewUrl", soundPreviewUrl);
    formData.append("downloadUrl", downloadUrl);

    if (sampleId) {
      await updateSample(sampleId, formData);
    } else {
      await createSample(formData);
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

      <Input {...register("genreId")} placeholder="Genre ID" />
      {errors.genreId && (
        <p className="text-red-500">{errors.genreId.message}</p>
      )}

      <div>
        <label>Sound Preview</label>
        <UploadDropzone
          endpoint="sampleUploader"
          onClientUploadComplete={(res) => {
            setSoundPreviewUrl(res?.[0]?.url || "");
          }}
          onUploadError={(error: Error) => {
            console.error(error);
          }}
        />
      </div>

      <div>
        <label>Sample File</label>
        <UploadDropzone
          endpoint="sampleUploader"
          onClientUploadComplete={(res) => {
            setDownloadUrl(res?.[0]?.url || "");
          }}
          onUploadError={(error: Error) => {
            console.error(error);
          }}
        />
      </div>

      <Button type="submit">
        {sampleId ? "Update Sample" : "Create Sample"}
      </Button>
    </form>
  );
}
