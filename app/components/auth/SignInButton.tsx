"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/app/components/ui/button";

export function SignInButton() {
  const handleSignIn = async () => {
    console.log("🔑 Starting Google OAuth sign-in process...");
    try {
      const result = await signIn("google", {
        callbackUrl: "/dashboard/stats",
        redirect: true
      });
      
      console.log("📥 Sign-in result:", result);
    } catch (error) {
      console.error("💥 Sign-in error:", error);
    }
  };

  return (
    <Button onClick={handleSignIn}>
      Sign in with Google
    </Button>
  );
}
