"use client";

import { RequestForm } from "@/app/components/dashboard/RequestForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";

export default function HelpPostCreateRoute() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Help Post</CardTitle>
        <CardDescription>
          Ask for help to create a specific Preset sound
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RequestForm />
      </CardContent>
    </Card>
  );
}
