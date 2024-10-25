"use client";

import { useUser } from "@clerk/nextjs";
import PhotographerAnalytics from "./PhotographerAnalytics";
import { redirect } from "next/navigation";

interface PhotographerDashboardProps {
  userId: string;
}

export default function PhotographerDashboard({
  userId,
}: PhotographerDashboardProps) {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <div>Loading...</div>;

  if (user?.id !== userId) {
    redirect("/dashboard");
  }

  return (
    <main className="my-5">
      <PhotographerAnalytics userId={userId} />
    </main>
  );
}
