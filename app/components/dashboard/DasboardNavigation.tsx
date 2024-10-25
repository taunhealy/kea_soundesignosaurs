"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  {
    name: "Dashboard",
    href: () => `/dashboard`,
  },
  {
    name: "Banner Picture",
    href: () => `/dashboard/banner`,
  },
  {
    name: "Photographer Profile",
    href: () => `/dashboard/profile`,
  },
];

export function DashboardNavigation() {
  const pathname = usePathname();
  const userId = pathname?.split("/")[2] ?? ""; // Provide a default empty string

  return (
    <>
      {links.map((link) => (
        <Link
          key={link.name}
          href={link.href()}
          className={cn(
            link.href() === pathname
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {link.name}
        </Link>
      ))}
    </>
  );
}
