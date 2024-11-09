import Link from "next/link";

import { Button } from "./ui/button";
import { ShoppingCart } from "lucide-react";
import { CartIndicator } from "./CartIndicator";

export default function NavbarContent() {
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
