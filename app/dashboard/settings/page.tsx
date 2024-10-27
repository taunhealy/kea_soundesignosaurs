"use client";

import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";

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
    <div>
      <h1>Settings</h1>
      {/* Other settings options */}
      <button
        onClick={deleteAccount}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
      >
        Delete Account
      </button>
    </div>
  );
}
