import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";

async function getTutorials() {
  const tutorials = await prisma.tutorial.findMany({
    include: {
      sounddesigner: {
        select: {
          name: true,
          profileImage: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return tutorials;
}

export default async function TutorialsPage() {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const tutorials = await getTutorials();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Tutorials</h1>
      {tutorials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutorials.map((tutorial) => (
            <div key={tutorial.id} className="border rounded-lg p-4 shadow-sm">
              <h2 className="text-xl font-semibold mb-2">{tutorial.title}</h2>
              <p className="text-gray-600 mb-4">{tutorial.description}</p>
              <div className="flex items-center mb-4">
                {tutorial.sounddesigner.profileImage && (
                  <img
                    src={tutorial.sounddesigner.profileImage}
                    alt={tutorial.sounddesigner.name}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                )}
                <span className="text-sm text-gray-500">
                  {tutorial.sounddesigner.name}
                </span>
              </div>
              <Link href={`/tutorials/${tutorial.id}`}>
                <Button>View Tutorial</Button>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center">
          <p className="text-xl mb-4">No tutorials available yet.</p>
          <Link href="/tutorials/create"></Link>
        </div>
      )}
    </div>
  );
}
