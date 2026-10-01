import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { HeaderNav } from "@/components/HeaderNav";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Yung Geeski — Sponsored Financial Content for Brands",
  description:
    "Data-driven finance videos for fintech companies, investing platforms, and finance brands — researched, animated, and published to an audience that watches to the end.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          {/* On mobile, HeaderNav slides this up with the scroll (--mobile-header-offset). */}
          <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 max-md:will-change-transform max-md:[transform:translate3d(0,calc(var(--mobile-header-offset,0px)*-1),0)]">
            <div className="container mx-auto w-full max-w-[100vw] px-3 sm:px-4 md:px-4">
              <HeaderNav />
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
