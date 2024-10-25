import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CreatePackageForm from "@/app/components/CreatePackageForm";

export default async function CreatePackagePage() {
  const { userId } = auth();
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Create New Package</h1>
      <CreatePackageForm />
    </div>
  );
}
