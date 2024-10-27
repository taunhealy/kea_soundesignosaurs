import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SoundDesignerNavigation } from "@/app/components/dashboard/SoundDesignerNavigation";
import { UserButton } from "@clerk/nextjs";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/sign-in");
  }

  // Redirect to presets page if the current path is exactly /dashboard
  if (
    typeof window !== "undefined" &&
    window.location.pathname === "/dashboard"
  ) {
    redirect("/dashboard/presets");
  }

  return (
    <div className="flex w-full flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <header className="sticky top-0 flex h-16 items-center justify-between border-b bg-white">
        <SoundDesignerNavigation />
        <div className="flex items-center">
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>
      <main className="flex-grow py-6">{children}</main>
    </div>
  );
}
