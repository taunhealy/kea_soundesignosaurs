"use client";

import Link from "next/link";
import { useCart } from "../hooks/useCart";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Button } from "@/app/components/ui/button";

export function Navbar() {
  const { cart } = useCart();
  const { isSignedIn, user } = useUser();

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          SoundDesignosaurs
        </Link>
        <ul className="flex space-x-4 items-center">
          <li>
            <Link href="/explore">Explore</Link>
          </li>
          {isSignedIn ? (
            <>
              <li>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button>Dashboard</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Dashboard</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">Overview</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/presets/create">
                        Upload Preset
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
              <li>
                <UserButton afterSignOutUrl="/" />
              </li>
            </>
          ) : (
            <>
              <li>
                <Link href="/sign-in">
                  <Button variant="default">Sign In</Button>
                </Link>
              </li>
              <li>
                <Link href="/register">
                  <Button>Register</Button>
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
