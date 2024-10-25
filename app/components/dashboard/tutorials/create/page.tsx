import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import TutorialForm from "@/app/components/TutorialForm";

export default async function CreateTutorialPage() {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/dashboard/tutorials">
        <Button variant="outline">← Back to Tutorials</Button>
      </Link>
      <h1 className="text-2xl font-bold my-4">Create New Tutorial</h1>
      <TutorialForm />
    </div>
  );
}

