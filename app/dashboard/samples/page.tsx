import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { deleteSample } from "@/app/actions/sampleActions";
import { UploadSampleButton } from "@/components/UploadSampleButton";

async function getSamples(userId: string) {
  const soundDesigner = await prisma.soundDesigner.findUnique({
    where: { userId },
    include: { samples: true },
  });
  return soundDesigner?.samples || [];
}

export default async function SamplesPage() {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const samples = await getSamples(userId);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Manage Samples</h1>
      <Link href="/dashboard/samples/create">
        <Button>Create New Sample</Button>
      </Link>
      <div className="mt-8">
        {samples.map((sample) => (
          <div key={sample.id} className="border p-4 mb-4 rounded">
            <h2 className="text-xl font-semibold">{sample.title}</h2>
            <p>{sample.description}</p>
            <p>Price: ${sample.price}</p>
            <div className="mt-2">
              <Link href={`/dashboard/samples/${sample.id}/edit`}>
                <Button variant="outline" className="mr-2">Edit</Button>
              </Link>
              <Button variant="destructive" onClick={() => deleteSample(sample.id)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
