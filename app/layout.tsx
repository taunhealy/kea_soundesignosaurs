import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/components/Navbar";
import { Providers } from "@/app/components/Providers";
import { ReduxProvider } from "./providers/ReduxProvider";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";

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
        <ClerkProvider dynamic={true}>
          <ReduxProvider>
            <Providers>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  {children}
                </main>
                <ToastContainer />
                <Toaster />
              </div>
            </Providers>
          </ReduxProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
