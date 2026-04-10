import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { HeaderNav } from "@/components/HeaderNav";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "YungGeeski — Viral Finance Content Workflow & Custom Charts",
  description: "Turn raw market data into viral finance content. 50 chart ideas + exact workflow — or get custom charts done for you.",
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
          <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
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
