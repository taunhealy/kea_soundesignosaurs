import Link from "next/link";
import { UserButton, useAuth } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { ShoppingCart } from "lucide-react";

export default function NavbarContent() {
  const { isSignedIn } = useAuth();

  return (
    <div className="flex items-center justify-between">
      <Link href="/" className="font-bold">
        Ripple
      </Link>
      <Link href="/dashboard" className="font-bold">
        Dashboard
      </Link>
      <div className="flex items-center gap-4">
        <Link href="/cart">
          <Button variant="ghost" size="icon">
            <ShoppingCart />
          </Button>
        </Link>
        {isSignedIn ? (
          <UserButton afterSignOutUrl="/" />
        ) : (
          <Link href="/sign-in">
            <Button>Sign In</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
