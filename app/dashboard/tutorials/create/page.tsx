"use client";

import { useState } from "react";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";
import { UploadDropzone } from "@/lib/uploadthing";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { SubmitButton } from "@/app/components/SubmitButtons";
import Image from "next/image";

const tutorialSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  content: z.string().min(1, "Content is required"),
  image: z.string().min(1, "Image is required"),
});

export default function TutorialCreateRoute() {
  const [image, setImage] = useState<string>("");

  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: tutorialSchema });
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Here you would typically send the form data to your server
    console.log("Form submitted", form.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Create Tutorial</CardTitle>
          <CardDescription>Create a new tutorial for your users</CardDescription>
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
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name={fields.description.name}
              defaultValue={fields.description.initialValue}
              aria-invalid={!!fields.description.errors}
            />
            {fields.description.errors && (
              <p className="text-sm text-red-500">{fields.description.errors}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              name={fields.content.name}
              defaultValue={fields.content.initialValue}
              rows={10}
              aria-invalid={!!fields.content.errors}
            />
            {fields.content.errors && (
              <p className="text-sm text-red-500">{fields.content.errors}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Tutorial Image</Label>
            <input
              type="hidden"
              name={fields.image.name}
              value={image}
            />
            {image ? (
              <div
