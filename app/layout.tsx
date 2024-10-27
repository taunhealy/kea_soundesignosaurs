import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Navbar } from "@/app/components/Navbar";
import { ReactQueryProvider } from "@/app/components/ReactQueryProvider";
import ErrorBoundary from "@/app/components/ErrorBoundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sounddesignosaurs",
  description: "Find the sound",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClerkProvider afterSignOutUrl="/">
          <ReactQueryProvider>
            <Navbar />
            <ErrorBoundary>
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {children}
              </main>
            </ErrorBoundary>
          </ReactQueryProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
