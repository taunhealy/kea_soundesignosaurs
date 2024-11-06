import { useUser } from "@clerk/clerk-react";
import { useState, useMemo, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { useRouter } from "next/navigation";
import { Label } from "@/app/components/ui/label";
import { toast } from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MultiSelect } from "@/app/components/ui/MultiSelect";

interface PresetPackFormProps {
  initialData?: {
    title: string;
    description?: string;
    price: number;
    presets: { preset: { id: string } }[];
  };
  packId?: string;
}

const presetPackSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .transform(str => str.charAt(0).toUpperCase() + str.slice(1))
    .refine(val => val.charAt(0) === val.charAt(0).toUpperCase(), {
      message: "Title must start with a capital letter",
    }),
  description: z
    .string()
    .optional()
    .transform(str => str ? str.charAt(0).toUpperCase() + str.slice(1) : str)
    .refine(val => !val || val.charAt(0) === val.charAt(0).toUpperCase(), {
      message: "Description must start with a capital letter",
    }),
  price: z.number().min(5, "Price must be at least $5"),
  presetIds: z.array(z.string())
    .min(5, "Pack must contain at least 5 presets")
    .max(9, "Pack cannot contain more than 9 presets"),
});

type PresetPackFormData = z.infer<typeof presetPackSchema>;

export function PresetPackForm({ initialData, packId }: PresetPackFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch user presets
  const { data: userPresets } = useQuery({
    queryKey: ["presets", "uploaded"],
    queryFn: async () => {
      const response = await fetch("/api/presets?type=uploaded");
      if (!response.ok) throw new Error("Failed to fetch presets");
      return response.json();
    },
  });

  // Transform presets into options
  const presetOptions = useMemo(() => {
    if (!userPresets) return [];
    return userPresets.map((preset: any) => ({
      value: preset.id,
      label: preset.title || "Untitled Preset",
    }));
  }, [userPresets]);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PresetPackFormData>({
    resolver: zodResolver(presetPackSchema),
    defaultValues: useMemo(
      () => ({
        title: initialData?.title || "",
        description: initialData?.description || "",
        price: initialData?.price || 5,
        presetIds: initialData?.presets?.map((p: any) => p.preset.id) || [],
      }),
      [initialData]
    ),
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        description: initialData.description || "",
        price: initialData.price,
        presetIds: initialData.presets?.map((p: any) => p.preset.id) || [],
      });
    }
  }, [initialData, reset]);

  // Handle form submission
  const mutation = useMutation({
    mutationFn: async (data: PresetPackFormData) => {
      const endpoint = packId
        ? `/api/presetPacks/${packId}`
        : "/api/presetPacks";
      const method = packId ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to save preset pack");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["presetPacks"] });
      if (packId) {
        queryClient.invalidateQueries({ queryKey: ["presetPack", packId] });
      }
      toast.success(
        `Preset pack ${packId ? "updated" : "created"} successfully`
      );
      router.push("/dashboard/packs");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    },
  });

  const onSubmit = (data: PresetPackFormData) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input {...register("title")} id="title" />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea {...register("description")} id="description" />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Price (USD)</Label>
        <Input
          type="number"
          step="0.01"
          min="5"
          {...register("price", { valueAsNumber: true })}
          id="price"
        />
        {errors.price && (
          <p className="text-sm text-red-500">{errors.price.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Select Presets</Label>
        {presetOptions.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No presets available. Please upload some presets first.
          </div>
        ) : (
          <Controller
            name="presetIds"
            control={control}
            render={({ field }) => {
              return (
                <MultiSelect
                  options={presetOptions}
                  value={field.value}
                  onChange={(newValue) => {
                    field.onChange(newValue);
                  }}
                  placeholder="Select presets..."
                />
              );
            }}
          />
        )}
        {errors.presetIds && (
          <p className="text-sm text-red-500">{errors.presetIds.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : packId ? "Update Pack" : "Create Pack"}
      </Button>
    </form>
  );
}
