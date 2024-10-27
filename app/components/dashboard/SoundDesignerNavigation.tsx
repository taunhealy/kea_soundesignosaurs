"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Music,
  FileAudio,
  Settings,
  HelpCircle,
} from "lucide-react";

const navItems = [
  {
    name: "Presets",
    href: "/dashboard/presets",
    icon: Music,
  },
  {
    name: "Samples",
    href: "/dashboard/samples",
    icon: FileAudio,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
  {
    name: "Help",
    href: "/dashboard/help",
    icon: HelpCircle,
  },
];

export function SoundDesignerNavigation() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-row space-x-4">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center px-4 py-2 text-sm font-medium rounded-md",
            (pathname === item.href || (pathname === "/dashboard" && item.href === "/dashboard/presets"))
              ? "bg-gray-100 text-gray-900"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <item.icon className="mr-3 h-5 w-5" />
          {item.name}
        </Link>
      ))}
    </nav>
  );
}
