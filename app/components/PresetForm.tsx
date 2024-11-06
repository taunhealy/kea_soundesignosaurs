"use client";

import { useUser } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { UploadDropzone } from "@/lib/uploadthing";
import { useRouter } from "next/navigation";
import { FileIcon, X } from "lucide-react";
import { Label } from "@/app/components/ui/label";
import { toast } from "react-hot-toast";
import { GenreCombobox } from "@/app/components/GenreCombobox";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatPresetFileName } from "@/utils/presetNaming";
import { PresetType } from "@prisma/client";

interface PresetFormProps {
  initialData?: any;
  presetId?: string;
}

const presetSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  guide: z.string().optional(),
  spotifyLink: z.string().optional(),
  genreId: z.string().optional(),
  vstId: z.string().optional(),
  priceType: z.enum(["FREE", "PREMIUM"]).optional(),
  presetType: z
    .enum(["PAD", "LEAD", "PLUCK", "BASS", "FX", "OTHER"])
    .optional(),
  price: z.number().optional(),
  presetFileUrl: z.string().optional(),
  originalFileName: z.string().optional(),
});

type PresetFormData = z.infer<typeof presetSchema>;

// Add predefined VST options
const VST_OPTIONS = [
  { value: "vital", label: "Vital" },
  { value: "serum", label: "Serum" },
  { value: "other", label: "Other" },
];

export function PresetForm({ initialData, presetId }: PresetFormProps) {
  const [soundPreviewUrl, setSoundPreviewUrl] = useState(
    initialData?.soundPreviewUrl || ""
  );
  const [uploadedFile, setUploadedFile] = useState<{
    url: string;
    name: string;
    originalName: string;
  } | null>(
    initialData?.presetFileUrl
      ? {
          url: initialData.presetFileUrl,
          name: initialData.presetFileUrl.split("/").pop() || "Existing File",
          originalName: initialData.originalFileName || "Existing File",
        }
      : null
  );
  const router = useRouter();
  const { user } = useUser();
  const queryClient = useQueryClient();

  const { data: genres } = useQuery({
    queryKey: ["genres"],
    queryFn: async () => {
      const response = await fetch("/api/genres");
      return response.json();
    },
  });

  const genresList =
    genres?.map((genre: any) => ({
      value: genre.id,
      label: genre.name,
    })) || [];

  // Replace the VST query with the predefined options
  const vstList = VST_OPTIONS;

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting: formIsSubmitting },
    setValue,
    watch,
    getValues,
  } = useForm<PresetFormData>({
    resolver: zodResolver(presetSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      guide: initialData?.guide || "",
      spotifyLink: initialData?.spotifyLink || "",
      genreId: initialData?.genre?.id || initialData?.genreId || "",
      vstId: initialData?.vst?.id || "",
      presetType: initialData?.presetType || undefined,
      price: initialData?.price || 0,
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      console.log("Setting initial data:", initialData);
      setValue("title", initialData.title);
      setValue("description", initialData.description);
      setValue("guide", initialData.guide);
      setValue("spotifyLink", initialData.spotifyLink);
      setValue("genreId", initialData.genre?.id || initialData.genreId);
      setValue("vstId", initialData.vst?.id);
      setValue("presetType", initialData.presetType);
      setValue("price", initialData.price || 0);

      if (initialData.soundPreviewUrl) {
        setSoundPreviewUrl(initialData.soundPreviewUrl);
      }
    }
  }, [initialData, setValue]);

  const onSubmit = async (data: PresetFormData) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      if (!user?.id) {
        throw new Error("User ID is required");
      }

      const formData = {
        userId: user.id, // Ensure userId is included first
        ...data,
        presetFileUrl: uploadedFile?.url || "",
        originalFileName: uploadedFile?.originalName || "",
        soundPreviewUrl: soundPreviewUrl || "",
        soundDesignerId: user.id,
        genreId: data.genreId || "",
        vstId: data.vstId || "",
      };

      console.log("Submitting data:", formData);

      const endpoint = presetId
        ? `/api/presetUpload/${presetId}`
        : "/api/presetUpload";
      const method = presetId ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();
      console.log("Server response:", responseData);

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to submit form");
      }

      // Invalidate and refetch queries
      await queryClient.invalidateQueries({
        queryKey: ["presets", "uploaded"],
      });
      await queryClient.invalidateQueries({ queryKey: ["preset", presetId] });

      toast.success(`Preset ${presetId ? "updated" : "created"} successfully`);
      router.push("/dashboard/presets");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onError = (errors: any) => {
    console.log("Form validation errors:", errors);
    Object.keys(errors).forEach((key) => {
      toast.error(`${key}: ${errors[key].message}`);
    });
  };

  const handleUpload = (res: any) => {
    if (res && res[0]) {
      console.log("UploadThing response:", res[0]);
      const originalFileName = res[0].name;
      const fileNameWithoutExt = originalFileName.replace(/\.[^/.]+$/, "");
      const fileExtension = originalFileName.split(".").pop();

      // Get current preset type from form
      const currentPresetType = watch("presetType") as PresetType;

      // Format the filename
      const formattedFileName = formatPresetFileName(
        fileNameWithoutExt,
        currentPresetType
      );

      // Add back the file extension
      const finalFileName = `${formattedFileName}.${fileExtension}`;

      console.log("Setting uploaded file:", {
        url: res[0].url,
        name: finalFileName,
        originalName: originalFileName,
      });

      setUploadedFile({
        url: res[0].url,
        name: finalFileName,
        originalName: originalFileName,
      });

      if (!watch("title")) {
        setValue("title", formattedFileName);
      }

      // Store both the URL and filename
      setValue("presetFileUrl", res[0].url);
      setValue("originalFileName", originalFileName);
    }
  };

  const priceType = watch("priceType");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        console.log("Form submitted, current values:", control._formValues);
        handleSubmit(onSubmit, onError)(e);
      }}
      className="space-y-4"
    >
      <Textarea {...register("description")} placeholder="Description" />
      {errors.description && (
        <p className="text-red-500">{errors.description.message}</p>
      )}

      <Input
        {...register("spotifyLink")}
        placeholder="Spotify Link (optional)"
      />
      {errors.spotifyLink && (
        <p className="text-red-500">{errors.spotifyLink.message}</p>
      )}

      <Controller
        name="presetType"
        control={control}
        render={({ field }) => (
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger>
              <SelectValue placeholder="Select Preset Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PAD">Pad</SelectItem>
              <SelectItem value="LEAD">Lead</SelectItem>
              <SelectItem value="PLUCK">Pluck</SelectItem>
              <SelectItem value="BASS">Bass</SelectItem>
              <SelectItem value="FX">FX</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        )}
      />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Upload Preset</h2>
        {uploadedFile ? (
          <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded">
            <FileIcon className="w-6 h-6 text-blue-500" />
            <span className="flex-1 truncate">{uploadedFile.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUploadedFile(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <UploadDropzone
            endpoint="presetUploader"
            onClientUploadComplete={handleUpload}
            onUploadError={(error: Error) => {
              alert(`ERROR! ${error.message}`);
            }}
          />
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Upload Audio Preview</h2>
        {soundPreviewUrl ? (
          <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded">
            <FileIcon className="w-6 h-6 text-blue-500" />
            <span className="flex-1 truncate">Audio Preview</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSoundPreviewUrl("")}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <UploadDropzone
            endpoint="audioUploader"
            onClientUploadComplete={(res) => {
              if (res && res[0]) {
                setSoundPreviewUrl(res[0].url);
                toast.success("Audio preview uploaded successfully");
              }
            }}
            onUploadError={(error: Error) => {
              toast.error(`Upload failed: ${error.message}`);
            }}
          />
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="priceType">Price Type</Label>
        <select {...register("priceType")} id="priceType">
          <option value="FREE">Free</option>
          <option value="PREMIUM">Premium</option>
        </select>
        {errors.priceType && (
          <p className="text-red-500">{errors.priceType.message}</p>
        )}
      </div>

      {priceType === "PREMIUM" && (
        <div className="space-y-2">
          <Label htmlFor="price">Price (USD)</Label>
          <Input
            type="number"
            step="0.01"
            min="5"
            {...register("price", { valueAsNumber: true })}
            id="price"
            placeholder="Enter price (minimum $5)"
          />
          {errors.price && (
            <p className="text-red-500">{errors.price.message}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label>Genre</Label>
        <Controller
          name="genreId"
          control={control}
          render={({ field }) => (
            <GenreCombobox
              value={field.value || ""}
              onChange={(value) => {
                field.onChange(value);
              }}
            />
          )}
        />
        {errors.genreId && (
          <p className="text-red-500">{errors.genreId.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>VST</Label>
        <Controller
          name="vstId"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select VST..." />
              </SelectTrigger>
              <SelectContent>
                {vstList.map((vst: { value: string; label: string }) => (
                  <SelectItem key={vst.value} value={vst.value}>
                    {vst.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
      {errors.vstId && <p className="text-red-500">{errors.vstId.message}</p>}

      <Button
        type="submit"
        disabled={isSubmitting || formIsSubmitting}
        className="w-full"
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>{presetId ? "Updating..." : "Creating..."}</span>
          </div>
        ) : (
          <span>{presetId ? "Update Preset" : "Create Preset"}</span>
        )}
      </Button>
    </form>
  );
}
