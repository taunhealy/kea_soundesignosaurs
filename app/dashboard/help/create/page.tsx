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
import { Genre } from "@/app/types/enums";
import { Combobox } from "@/app/components/ui/combobox";

const helpPostSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    youtubeLink: z.string().url("Invalid YouTube URL").optional(),
    enquiryDetails: z.string().min(1, "Enquiry details are required"),
    genre: z.string().min(1, "Please select a genre"),
    customGenre: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.genre === "OTHER") {
        return data.customGenre !== undefined && data.customGenre.length > 0;
      }
      return true;
    },
    {
      message: "Please enter a custom genre",
      path: ["customGenre"],
    }
  );

export default function HelpPostCreateRoute() {
  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: helpPostSchema });
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Here you would typically send the form data to your server
    console.log("Form submitted", form.value);
  };

  const genreOptions = [
    ...Object.values(Genre).map((genre) => ({
      label: genre,
      value: genre,
    })),
    { label: "Other", value: "OTHER" },
  ];

  return (
    <form onSubmit={handleSubmit}>
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
            <Label htmlFor="genre">Genre</Label>
            <Combobox
              value={fields.genre.value || ""}
              onSelect={(value) => {
                form.update({
                  [fields.genre.name]: value,
                  [fields.customGenre.name]:
                    value !== "OTHER" ? undefined : fields.customGenre.value,
                });
              }}
              options={genreOptions}
              placeholder="Search for a genre"
            />
            {fields.genre.errors && (
              <p className="text-sm text-red-500">{fields.genre.errors}</p>
            )}
          </div>

          {fields.genre.value === "OTHER" && (
            <div className="space-y-2">
              <Label htmlFor="customGenre">Custom Genre</Label>
              <Input
                id="customGenre"
                name={fields.customGenre.name}
                defaultValue={fields.customGenre.initialValue}
                aria-invalid={!!fields.customGenre.errors}
              />
              {fields.customGenre.errors && (
                <p className="text-sm text-red-500">
                  {fields.customGenre.errors}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="enquiryDetails">Enquiry Details</Label>
            <Textarea
              id="enquiryDetails"
              name={fields.enquiryDetails.name}
              defaultValue={fields.enquiryDetails.initialValue}
              rows={6}
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
