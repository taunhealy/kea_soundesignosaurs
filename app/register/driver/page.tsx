import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DriverRegistrationForm } from "@/app/components/DriverRegistrationForm";

export default async function DriverRegistrationPage() {
  const { userId } = auth();
  const user = await currentUser();

  if (!userId) {
    redirect("/sign-up");
  }

  if (!user) {
    return <div>Loading user information...</div>;
  }

  const formattedUser = {
    firstName: user.firstName ?? undefined,
    lastName: user.lastName ?? undefined,
    emailAddresses: user.emailAddresses,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Driver Registration</h1>
      <DriverRegistrationForm user={formattedUser} />
    </div>
  );
}
