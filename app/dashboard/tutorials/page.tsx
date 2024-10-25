import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";

async function getTutorials(userId: string) {
  const soundDesigner = await prisma.soundDesigner.findUnique({
    where: { userId },
    include: { tutorials: true },
  });
  return soundDesigner?.tutorials || [];
}

export default async function TutorialsPage() {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const tutorials = await getTutorials(userId);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Manage Tutorials</h1>
      <Link href="/dashboard/tutorials/create">
        <Button>Create New Tutorial</Button>
      </Link>
      <div className="mt-8">
        {tutorials.map((tutorial) => (
          <div key={tutorial.id} className="border p-4 mb-4 rounded">
            <h2 className="text-xl font-semibold">{tutorial.title}</h2>
            <p>{tutorial.description}</p>
            <div className="mt-2">
              <Link href={`/dashboard/tutorials/${tutorial.id}/edit`}>
                <Button variant="outline" className="mr-2">
                  Edit
                </Button>
              </Link>
              <Button variant="destructive">Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
