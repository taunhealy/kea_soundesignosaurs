import { ReactNode } from "react";
import SeekerNavigation from "./SeekerNavigation";

interface SeekerDashboardProps {
  userId: string;
}

export default function SeekerDashboard({ userId }: SeekerDashboardProps) {
  return (
    <>
      <header className="sticky top-0 flex h-16 items-center justify-between gap-4 border-b bg-white">
        <SeekerNavigation />
        {/* Add user menu, notifications, etc. */}
      </header>
    </>
  );
}
