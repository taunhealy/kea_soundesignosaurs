"use client";

import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function DeleteRequestRoute({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/request-threads/${params.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete request");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Request deleted successfully");
      router.push("/dashboard/requests");
    },
    onError: (error) => {
      console.error("Error deleting request:", error);
      toast.error("Failed to delete request");
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  return (
    <div className="h-[80vh] w-full flex items-center justify-center">
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Are you absolutely sure?</CardTitle>
          <CardDescription>
            This action cannot be undone. This will permanently delete this
            request thread and remove all data from our servers.
          </CardDescription>
        </CardHeader>
        <CardFooter className="w-full flex justify-between">
          <Button variant="secondary" asChild>
            <Link href="/dashboard/requests">Cancel</Link>
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete Request"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
