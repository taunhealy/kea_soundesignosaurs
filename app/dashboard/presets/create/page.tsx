import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SampleForm } from "@/app/components/SampleForm";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";

export default async function CreateSamplePage() {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/dashboard/samples">
        <Button variant="outline">← Back to Samples</Button>
      </Link>
      <h1 className="text-2xl font-bold my-4">Create New Sample</h1>
      <SampleForm />
    </div>
  );
}
