"use client";

import { useAuth } from "@clerk/clerk-react";
import { NavbarWrapper } from "@/app/components/Navbar";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn } = useAuth();

  return (
    <>
      <NavbarWrapper isAuthenticated={!!isSignedIn} />
      {children}
    </>
  );
}
