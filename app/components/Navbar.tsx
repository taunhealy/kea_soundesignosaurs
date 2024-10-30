"use client";

import Link from "next/link";
import { useCart } from "../hooks/useCart";
import { UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";

interface NavbarProps {
  isAuthenticated: boolean;
}

export function Navbar({ isAuthenticated }: NavbarProps) {
  const { cart } = useCart();

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
          {isAuthenticated ? (
            <>
              <li>
                <Link href="/dashboard">
                  <Button>Dashboard</Button>
                </Link>
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
