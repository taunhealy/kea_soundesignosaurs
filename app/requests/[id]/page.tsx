"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";

interface RequestThread {
  id: string;
  userId: string;
  title: string;
  youtubeLink: string;
  timestamp: string;
  genre: string;
  status: "OPEN" | "ASSISTED" | "SATISFIED";
  username: string;
  submissions?: Array<{
    id: string;
    userId: string;
    username: string;
    title: string;
    soundPreviewUrl?: string;
    presetFileUrl?: string;
    guide?: string;
    timestamp: string;
  }>;
}

export default function RequestPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data: request, isLoading, error } = useQuery<RequestThread>({
    queryKey: ["request", id],
    queryFn: async () => {
      const response = await fetch(`/api/request-threads/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch request");
      }
      return response.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading request</div>;
  if (!request) return <div>Request not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>{request.title}</CardTitle>
          <CardDescription>Posted by {request.username}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Status: {request.status}</span>
              <span>Genre: {request.genre}</span>
            </div>
            
            {request.youtubeLink && (
              <div>
                <h3 className="font-medium mb-2">Reference Track:</h3>
                <a 
                  href={request.youtubeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  YouTube Link
                </a>
              </div>
            )}

            {request.submissions && request.submissions.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Submissions:</h3>
                <div className="space-y-4">
                  {request.submissions.map((submission) => (
                    <Card key={submission.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{submission.title}</CardTitle>
                        <CardDescription>By {submission.username}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {submission.guide && (
                          <p className="text-sm text-muted-foreground">{submission.guide}</p>
                        )}
                        {submission.soundPreviewUrl && (
                          <div className="mt-2">
                            <audio controls src={submission.soundPreviewUrl} />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
