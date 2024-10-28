"use client";

import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { UsernameSettings } from "@/app/components/settings/UsernameSettings";
import { Button } from "@/app/components/ui/button";

export default function SettingsPage() {
  const { signOut } = useClerk();
  const router = useRouter();

  const deleteAccount = async () => {
    if (
      !confirm(
        "Are you sure you want to delete your account? This cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

      <div className="space-y-6">
        <UsernameSettings />

        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-red-600">
            Danger Zone
          </h2>
          <Button onClick={deleteAccount} variant="destructive">
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
}
