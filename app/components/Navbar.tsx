"use client";

import Link from "next/link";
import { UserButton, useAuth } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { ShoppingCart } from "lucide-react";
import { memo } from "react";
import dynamic from 'next/dynamic'

const DynamicNavbar = dynamic(() => import('./NavbarContent'), {
  ssr: false
})

export default function Navbar() {
  return <DynamicNavbar />
}
