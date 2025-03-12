import Navbar from "@/components/layout/Navbar";
import { cn } from "@/lib/utils";
import SocketProvider from "@/provider/SocketProvider";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VidChat",
  description: "A video chat app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={cn(
            geistSans.variable,
            geistMono.variable,
            "antialiased"
          )}
        >
          <SocketProvider>
            <main className="flex flex-col min-h-screen bg-secondary">
              <Navbar />
              {children}
            </main>
          </SocketProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
