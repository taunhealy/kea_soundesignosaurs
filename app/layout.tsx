import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar as NavbarWrapper } from "@/app/components/Navbar";
import { Providers } from "@/app/components/Providers";
import { ReduxProvider } from "./providers/ReduxProvider";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { ClerkProvider } from "@clerk/nextjs";

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
        <ClerkProvider>
          <ReduxProvider>
            <Providers>
              <NavbarWrapper isAuthenticated={false} />
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {children}
              </main>
            </Providers>
          </ReduxProvider>
          <ToastContainer />
        </ClerkProvider>
      </body>
    </html>
  );
}
