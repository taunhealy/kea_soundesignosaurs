"use client";

import Link from "next/link";
import { CartIndicator } from "./CartIndicator";

export default function Navbar() {
  return (
    <div className="flex items-center justify-between p-9">
      <Link href="/" className="font-bold">
        Ripple
      </Link>
      <Link href="/dashboard" className="font-bold">
        Dashboard
      </Link>
      <CartIndicator />
    </div>
  );
}
