import { auth } from "@clerk/nextjs/server";
import { Navbar } from "./Navbar";
import { redirect } from "next/navigation";

export async function NavbarWrapper() {
  // Get auth state
  const { userId } = await auth();
  
  // Log the auth state to verify it's working
  console.log("Auth state:", { userId });

  return <Navbar isAuthenticated={!!userId} />;
}
