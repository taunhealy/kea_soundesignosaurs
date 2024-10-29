"use client";

import { ReactQueryProvider } from "@/app/components/ReactQueryProvider";
import ErrorBoundary from "@/app/components/ErrorBoundary";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <ErrorBoundary>{children}</ErrorBoundary>
    </ReactQueryProvider>
  );
}
