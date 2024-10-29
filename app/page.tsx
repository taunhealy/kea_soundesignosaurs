"use client";

import { SearchSidebar, SearchFilters } from "@/app/components/SearchSidebar";
import { ExploreGrid } from "@/app/components/ExploreGrid";
import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";

const filterCategories = [
  {
    name: "All",
    href: "/",
  },
  {
    name: "Presets",
    href: "/?category=presets",
  },
  {
    name: "Requests",
    href: "/?category=requests",
  },
];

export default function HomePage() {
  // @ts-ignore
  const reduxFilters = useSelector((state: RootState) => state.searchFilters);
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: "",
    genres: [],
    vsts: [],
    presetTypes: [],
    category:
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("category") || ""
        : "",
    showAll: false,
    types: [],
  });

  const pathname = usePathname();
  const searchParams = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );

  return (
    <div className="flex flex-col">
      <nav className="sticky top-0 flex h-16 items-center border-b bg-white px-4">
        <div className="flex space-x-4">
          {filterCategories.map((category) => {
            const isActive =
              category.href === "/"
                ? pathname === "/" && !searchParams.get("category")
                : searchParams.get("category") === category.href.split("=")[1];

            return (
              <Link
                key={category.href}
                href={category.href}
                className={cn(
                  "flex items-center px-4 py-2 text-sm font-medium rounded-md",
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                {category.name}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="flex">
        <SearchSidebar filters={filters} setFilters={setFilters} />
        {/* @ts-ignore */}
        <ExploreGrid filters={filters} />
      </div>
    </div>
  );
}
