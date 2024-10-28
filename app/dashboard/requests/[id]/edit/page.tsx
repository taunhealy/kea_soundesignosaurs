"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { RequestForm } from "@/app/components/dashboard/RequestForm";
import { Button } from "@/app/components/ui/button";
import Link from "next/link";

export default function EditRequestPage() {
  const params = useParams();
  const id = params?.id as string;

  const {
    data: requestData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["request", id],
    queryFn: async () => {
      const response = await fetch(`/api/request-threads/${id}`);
      if (!response.ok) {
        console.error("Error fetching request:", response.statusText);
        throw new Error("Error fetching request");
      }
      return response.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) {
    console.error("Error loading request:", error);
    return <div>Error loading request</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Link href="/dashboard/requests">
          <Button variant="outline">← Back to Requests</Button>
        </Link>
        <Link href={`/dashboard/requests/${id}/delete`}>
          <Button variant="destructive">Delete Request</Button>
        </Link>
      </div>
      <h1 className="text-2xl font-bold my-4">Edit Request</h1>
      <RequestForm initialData={requestData} requestId={id} />
    </div>
  );
}
