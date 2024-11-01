"use client";

import { SoundDesignerNavigation } from "@/app/components/dashboard/SoundDesignerNavigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <SoundDesignerNavigation />
        </div>
      </div>
      <main>{children}</main>
    </div>
  );
}
