import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PhotographerRegistrationForm } from "@/app/components/PhotographerRegistrationForm";

export default async function PhotographerRegistrationPage() {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-up");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Photographer Registration</h1>
      <PhotographerRegistrationForm userId={userId} />
    </div>
  );
}

