import { auth } from "@clerk/nextjs/server";
import { Navbar } from "./Navbar";

export async function NavbarWrapper() {
  const { userId } = await auth();
  return <Navbar isAuthenticated={!!userId} />;
}
