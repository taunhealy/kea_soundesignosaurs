import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PresetForm } from "@/app/components/PresetForm";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";

export default async function CreatePresetPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/dashboard/presets">
        <Button variant="outline">← Back to Presets</Button>
      </Link>
      <h1 className="text-2xl font-bold my-4">Create New Preset</h1>
      <PresetForm />
    </div>
  );
}
