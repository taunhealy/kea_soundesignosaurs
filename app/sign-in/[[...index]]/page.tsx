"use client";

import { SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const searchParams = useSearchParams();
  const type = searchParams?.get("type") || "";

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const userType = user.publicMetadata.userType as string | undefined;
      if (userType) {
        router.push("/dashboard");
      } else {
        router.push(`/register/${type}`);
      }
    }
  }, [isLoaded, isSignedIn, user, router, type]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        fallbackRedirectUrl={`/register/${type}`}
      />
    </div>
  );
}
