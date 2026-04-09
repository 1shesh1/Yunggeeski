import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { HeaderNav } from "@/components/HeaderNav";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "YungGeeski — Data-Driven Financial Charts & Course",
  description: "Fixed pricing. Clear scope. Professional delivery. Charts and course.",
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
          <header className="border-b">
            <div className="container mx-auto px-4 py-4 flex items-center w-full">
              <Link href="/" className="font-semibold text-lg shrink-0">
                Yung<span className="text-secondary">Geeski</span>
              </Link>
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
