"use client";

import { MultiCartView } from "../components/MultiCartView";

export default function CartPage() {
  return (
    <div className="flex flex-col items-center container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
      <MultiCartView />
    </div>
  );
}
