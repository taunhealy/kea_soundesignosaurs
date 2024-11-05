"use client";

import { ReactQueryProvider } from "@/app/components/ReactQueryProvider";
import { SearchProvider } from "@/contexts/SearchContext";
import ErrorBoundary from "@/app/components/ErrorBoundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useState } from "react";

const ReactQueryDevtools = dynamic(
  () =>
    import("@tanstack/react-query-devtools").then(
      (mod) => mod.ReactQueryDevtools
    ),
  {
    ssr: false,
  }
);

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ReactQueryProvider>
      <SearchProvider>
        <ErrorBoundary>{children}</ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </SearchProvider>
    </ReactQueryProvider>
  );
}
