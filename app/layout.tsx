import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NavbarWrapper } from "@/app/components/NavBarWrapper";
import { Providers } from "@/app/components/Providers";
import { ReduxProvider } from "./providers/ReduxProvider";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { auth } from "@clerk/nextjs/server";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sounddesignosaurs",
  description: "Find the sound",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider dynamic>
      <html lang="en">
        <body className={inter.className}>
          <ReduxProvider>
            <NavbarWrapper />
            <Providers>
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {children}
              </main>
            </Providers>
            <ToastContainer />
            <Toaster />
          </ReduxProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
