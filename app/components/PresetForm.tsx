"use client";

import { useUser } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Checkbox } from "@/app/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { UploadDropzone } from "@/lib/uploadthing";
import { useRouter } from "next/navigation";
import { FileIcon, X, Upload } from "lucide-react";
import { Label } from "@/app/components/ui/label";
import { toast } from "react-hot-toast"; // Add this import if you're using react-hot-toast for notificationsimport { useUser } from "@clerk/nextjs";
import { GenreCombobox } from "@/app/components/GenreCombobox";

const presetSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  guide: z.string().min(1, "Guide is required"),
  spotifyLink: z.string().url().optional().or(z.literal("")),
  genre: z.string().optional(), // Changed from genreId to genre
  vstType: z.enum(["SERUM", "VITAL"]),
  presetType: z.enum(["Pad", "Lead", "Pluck", "Bass", "FX", "Other"]),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
  isFree: z.boolean(),
  soundPreviewUrl: z.string().optional(),
  presetFileUrl: z.string().min(1, "Preset file is required"),
  audioUrl: z.string().optional(),
  price: z.number().optional(),
  downloadUrl: z.string().optional(),
  vstId: z.string().optional(),
});

type PresetFormData = z.infer<typeof presetSchema>;

interface PresetFormProps {
  initialData?: PresetFormData;
  presetId?: string;
}

export function PresetForm({ initialData, presetId }: PresetFormProps) {
  console.log("PresetForm initialData:", initialData);
  const [genres, setGenres] = useState<Array<{ id: string; name: string }>>([]);
  const [soundPreviewUrl, setSoundPreviewUrl] = useState(
    initialData?.soundPreviewUrl || ""
  );
  const [presetFileUrl, setPresetFileUrl] = useState(
    initialData?.presetFileUrl || ""
  );
  const [uploadedFile, setUploadedFile] = useState<{
    url: string;
    name: string;
  } | null>(
    initialData?.presetFileUrl
      ? { url: initialData.presetFileUrl, name: "Existing Preset" }
      : null
  );
  const [soundPreviewFile, setSoundPreviewFile] = useState<{
    url: string;
    name: string;
  } | null>(
    initialData?.soundPreviewUrl
      ? { url: initialData.soundPreviewUrl, name: "Existing Sound Preview" }
      : null
  );

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useForm<PresetFormData>({
    resolver: zodResolver(presetSchema),
    defaultValues: {
      ...initialData,
      genre: initialData?.genre || "",
      isFree: initialData ? initialData.price === 0 : false,
    },
  });

  // Add this useEffect to log the form values
  useEffect(() => {
    console.log("Form values:", watch());
  }, [watch]);

  // Add this log
  console.log("Form errors:", errors);

  const isFree = watch("isFree");

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();

  // Add this state
  const [vsts, setVsts] = useState<Array<{ id: string; name: string }>>([]);

  // Add this useEffect
  useEffect(() => {
    const fetchVsts = async () => {
      const response = await fetch("/api/vsts");
      if (response.ok) {
        const data = await response.json();
        setVsts(data);
      }
    };
    fetchVsts();
  }, []);

  useEffect(() => {
    // Fetch genres when component mounts
    const fetchGenres = async () => {
      try {
        const response = await fetch("/api/genres");
        if (!response.ok) throw new Error("Failed to fetch genres");
        const data = await response.json();
        setGenres(data);
      } catch (error) {
        console.error("Error fetching genres:", error);
        toast.error("Failed to load genres");
      }
    };

    fetchGenres();
  }, []);

  const onSubmit = async (data: PresetFormData) => {
    if (!isLoaded || !isSignedIn) {
      toast.error("Please sign in to submit a preset");
      return;
    }

    setIsSubmitting(true);
    try {
      // Get or create sound designer
      const soundDesignerResponse = await fetch(
        `/api/sound-designers/user/${user.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: user.fullName || `${user.firstName} ${user.lastName}`,
            email: user.primaryEmailAddress?.emailAddress || "",
            profileImage: user.imageUrl,
          }),
        }
      );

      if (!soundDesignerResponse.ok) {
        throw new Error("Failed to get/create sound designer information");
      }

      const soundDesigner = await soundDesignerResponse.json();

      // Convert tags string to array if it's a string
      const tags =
        typeof data.tags === "string"
          ? data.tags.split(",").map((tag) => tag.trim())
          : data.tags || [];

      const presetData = {
        title: data.title,
        description: data.description,
        guide: data.guide,
        spotifyLink: data.spotifyLink || null,
        soundPreviewUrl: data.soundPreviewUrl || null,
        presetFileUrl: data.presetFileUrl,
        presetType: data.presetType,
        vstType: data.vstType,
        tags: tags,
        price: data.isFree ? 0 : data.price || 0,
        soundDesignerId: soundDesigner.id,
        genre: data.genre, // Remove the conversion to enum format
      };

      const response = await fetch(
        `/api/presets${presetId ? `/${presetId}` : ""}`,
        {
          method: presetId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(presetData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save preset");
      }

      const result = await response.json();
      toast.success("Preset saved successfully");
      router.push("/dashboard/presets");
    } catch (error) {
      console.error("Error in onSubmit:", error);
      toast.error(
        `Failed to save preset: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpload = (res: any) => {
    if (res && res[0]) {
      setUploadedFile({ url: res[0].url, name: res[0].name });
      setValue("presetFileUrl", res[0].url);
    }
  };

  const handleRemove = () => {
    setUploadedFile(null);
    setValue("presetFileUrl", "");
  };

  const handleSoundPreviewUpload = (res: any) => {
    if (res && res[0]) {
      const url = res[0].url;
      console.log("Uploaded sound preview URL:", url);
      setSoundPreviewFile({ url, name: res[0].name });
      setSoundPreviewUrl(url);
      setValue("soundPreviewUrl", url);
      trigger("soundPreviewUrl"); // Trigger re-validation
    }
  };

  const handleRemoveSoundPreview = () => {
    setSoundPreviewFile(null);
    setSoundPreviewUrl("");
  };

  const saveFormData = (data: PresetFormData) => {
    localStorage.setItem("presetFormData", JSON.stringify(data));
  };

  const loadFormData = (): PresetFormData | null => {
    const savedData = localStorage.getItem("presetFormData");
    return savedData ? JSON.parse(savedData) : null;
  };

  console.log("Rendering PresetForm");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        console.log("Form submit event triggered");
        handleSubmit((data) => {
          console.log("Form data to be submitted:", data); // Debug log
          onSubmit(data);
        })(e);
      }}
      className="space-y-4"
    >
      <Input {...register("title")} placeholder="Title" />
      {errors.title && <p className="text-red-500">{errors.title.message}</p>}

      <Textarea {...register("description")} placeholder="Description" />
      {errors.description && (
        <p className="text-red-500">{errors.description.message}</p>
      )}

      <Textarea {...register("guide")} placeholder="Guide" />
      {errors.guide && <p className="text-red-500">{errors.guide.message}</p>}

      <Input
        {...register("spotifyLink")}
        placeholder="Spotify Link (optional)"
      />
      {errors.spotifyLink && (
        <p className="text-red-500">{errors.spotifyLink.message}</p>
      )}

      <div className="flex flex-col gap-2">
        <Label>Genre</Label>
        <GenreCombobox
          value={watch("genre") || ""}
          onChange={(value) => {
            setValue("genre", value);
          }}
        />
        {errors.genre && <p className="text-red-500">{errors.genre.message}</p>}
      </div>

      <Controller
        name="vstType"
        control={control}
        render={({ field }) => (
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger>
              <SelectValue placeholder="Select VST Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SERUM">Serum</SelectItem>
              <SelectItem value="VITAL">Vital</SelectItem>
            </SelectContent>
          </Select>
        )}
      />
      {errors.vstType && (
        <p className="text-red-500">{errors.vstType.message}</p>
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
              <SelectItem value="Pad">Pad</SelectItem>
              <SelectItem value="Lead">Lead</SelectItem>
              <SelectItem value="Pluck">Pluck</SelectItem>
              <SelectItem value="Bass">Bass</SelectItem>
              <SelectItem value="FX">FX</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        )}
      />
      {errors.presetType && (
        <p className="text-red-500">{errors.presetType.message}</p>
      )}

      <Input {...register("tags")} placeholder="Tags (comma-separated)" />
      {errors.tags && <p className="text-red-500">{errors.tags.message}</p>}

      <div className="flex items-center space-x-2">
        <Controller
          name="isFree"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="isFree"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Label
          htmlFor="isFree"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Is Free
        </Label>
      </div>
      {errors.isFree && <p className="text-red-500">{errors.isFree.message}</p>}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Upload Sound Preview</h2>
        {soundPreviewFile ? (
          <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded">
            <FileIcon className="w-6 h-6 text-blue-500" />
            <span className="flex-1 truncate">{soundPreviewFile.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveSoundPreview}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <UploadDropzone
            endpoint="presetUploader"
            onClientUploadComplete={handleSoundPreviewUpload}
            onUploadError={(error: Error) => {
              alert(`ERROR! ${error.message}`);
            }}
          />
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Upload Preset</h2>
        {uploadedFile ? (
          <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded">
            <FileIcon className="w-6 h-6 text-blue-500" />
            <span className="flex-1 truncate">{uploadedFile.name}</span>
            <Button variant="ghost" size="sm" onClick={handleRemove}>
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
        {errors.presetFileUrl && (
          <p className="text-red-500">{errors.presetFileUrl.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        onClick={() => console.log("Submit button clicked")}
      >
        {isSubmitting
          ? "Saving..."
          : presetId
          ? "Update Preset"
          : "Create Preset"}
      </Button>
    </form>
  );
}
