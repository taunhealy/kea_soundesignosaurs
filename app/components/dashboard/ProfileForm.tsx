"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePhotographerProfile } from "@/app/actions/updatePhotographerProfile";
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
import { UploadDropzone } from "@uploadthing/react";
import Image from "next/image";
import { useState } from "react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

interface ProfileFormProps {
  userId: string;
  initialData: any;
}

export default function ProfileForm({ userId, initialData }: ProfileFormProps) {
  const { user } = useUser();

  if (!user || user.id !== userId) {
    redirect("/");
  }

  const { register, handleSubmit, setValue, watch, control } = useForm({
    defaultValues: initialData,
  });
  const [profileImage, setProfileImage] = useState(initialData.profileImage);
  const [selectedImages, setSelectedImages] = useState<string[]>(
    initialData.selectedImages || []
  );
  const queryClient = useQueryClient();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "packages",
  });

  const mutation = useMutation({
    mutationFn: (formData: FormData) => updatePhotographerProfile(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photographerProfile"] });
    },
  });

  const onSubmit = async (data: any) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) =>
      formData.append(key, value as string)
    );
    formData.append("profileImage", profileImage);
    formData.append("selectedImages", JSON.stringify(selectedImages));
    await mutation.mutateAsync(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Profile Image
        </label>
        {profileImage && (
          <Image
            src={profileImage}
            alt="Profile"
            width={100}
            height={100}
            className="mt-2 rounded-full"
          />
        )}
        <UploadDropzone<OurFileRouter, "imageUploader">
          endpoint="imageUploader"
          onClientUploadComplete={(res) => {
            setProfileImage(res?.[0]?.url || "");
          }}
          onUploadError={(error: Error) => {
            console.error(error);
          }}
        />
      </div>

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Name
        </label>
        <Input id="name" {...register("name")} className="mt-1" />
      </div>

      <div>
        <label
          htmlFor="location"
          className="block text-sm font-medium text-gray-700"
        >
          Location
        </label>
        <Input id="location" {...register("location")} className="mt-1" />
      </div>

      <div>
        <label
          htmlFor="priceRange"
          className="block text-sm font-medium text-gray-700"
        >
          Price Range
        </label>
        <Select
          onValueChange={(value) =>
            register("priceRange").onChange({ target: { value } })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select price range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="budget">Budget</SelectItem>
            <SelectItem value="mid-range">Mid-range</SelectItem>
            <SelectItem value="luxury">Luxury</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Photography Packages</h3>
        {fields.map((field, index) => (
          <div key={field.id} className="border p-4 rounded-md mb-4">
            <Input
              {...register(`packages.${index}.title`)}
              placeholder="Package Title"
              className="mb-2"
            />
            <Input
              {...register(`packages.${index}.price`, { valueAsNumber: true })}
              type="number"
              placeholder="Price"
              className="mb-2"
            />
            <Input
              {...register(`packages.${index}.editedPhotos`, {
                valueAsNumber: true,
              })}
              type="number"
              placeholder="Number of Edited Photos"
              className="mb-2"
            />
            <Input
              {...register(`packages.${index}.shootingHours`, {
                valueAsNumber: true,
              })}
              type="number"
              placeholder="Shooting Hours"
              className="mb-2"
            />
            <Input
              {...register(`packages.${index}.turnaroundDays`, {
                valueAsNumber: true,
              })}
              type="number"
              placeholder="Turnaround Days"
              className="mb-2"
            />
            <Button
              type="button"
              onClick={() => remove(index)}
              variant="destructive"
            >
              Remove Package
            </Button>
          </div>
        ))}
        <Button
          type="button"
          onClick={() =>
            append({
              title: "",
              price: 0,
              editedPhotos: 0,
              shootingHours: 0,
              turnaroundDays: 0,
            })
          }
        >
          Add Package
        </Button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Selected Images (up to 9)
        </label>
        <div className="grid grid-cols-3 gap-4 mt-2">
          {selectedImages.map((image, index) => (
            <div key={index} className="relative">
              <Image
                src={image}
                alt={`Selected image ${index + 1}`}
                width={100}
                height={100}
                className="object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() =>
                  setSelectedImages(
                    selectedImages.filter((_, i) => i !== index)
                  )
                }
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
              >
                X
              </button>
            </div>
          ))}
          {selectedImages.length < 9 && (
            <UploadDropzone<OurFileRouter, "imageUploader">
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                if (res && res[0]) {
                  setSelectedImages([...selectedImages, res[0].url]);
                }
              }}
              onUploadError={(error: Error) => {
                console.error(error);
              }}
            />
          )}
        </div>
      </div>

      <Button type="submit">Update Profile</Button>
    </form>
  );
}
