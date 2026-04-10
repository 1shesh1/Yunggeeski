"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, Instagram, Youtube } from "lucide-react";
import { cn } from "@/lib/utils";
import { SOCIAL } from "@/lib/site";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

function SocialLinks({ iconClassName = "h-4 w-4" }: { iconClassName?: string }) {
  return (
    <>
      <a
        href={SOCIAL.instagram}
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Instagram"
      >
        <Instagram className={iconClassName} />
      </a>
      <a
        href={SOCIAL.youtube}
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground hover:text-foreground transition-colors"
        aria-label="YouTube"
      >
        <Youtube className={iconClassName} />
      </a>
      <a
        href={SOCIAL.tiktok}
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground hover:text-foreground transition-colors"
        aria-label="TikTok"
      >
        <TikTokIcon className={iconClassName} />
      </a>
    </>
  );
}

export function HeaderNav() {
  const pathname = usePathname();
  const onCharts = pathname.startsWith("/charts") || pathname.startsWith("/checkout") || pathname.startsWith("/order");
  const onWorkflow = pathname === "/" || pathname.startsWith("/workflow");
  const onResources = pathname.startsWith("/about") || pathname.startsWith("/faq") || pathname.startsWith("/terms") || pathname.startsWith("/downloads") || pathname.startsWith("/orders");

  return (
    <>
      <div className="flex-1 flex justify-center min-w-0">
        <nav className="flex items-center gap-1 min-w-0">
          <Link
            href="/"
            className={cn(
              "px-3 py-2 rounded-md text-sm font-medium transition-colors",
              onWorkflow
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            Workflow
          </Link>
          <Link
            href="/charts"
            className={cn(
              "px-3 py-2 rounded-md text-sm font-medium transition-colors",
              onCharts
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            Custom Charts
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "px-3 py-2 h-auto rounded-md text-sm font-medium transition-colors",
                  onResources
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                Resources
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/about">About</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/faq">FAQ</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/terms">Terms</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/downloads">Course Access</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/orders">Orders</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
      {/* Desktop: show social icons in header */}
      <div className="hidden md:flex items-center gap-3 border-l border-border pl-3 shrink-0">
        <SocialLinks />
      </div>
      {/* Mobile / narrow: collapse social into a dropdown to avoid overflow */}
      <div className="flex md:hidden items-center border-l border-border pl-3 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground shrink-0"
              aria-label="Follow us on social"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <Instagram className="h-4 w-4" />
                Instagram
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={SOCIAL.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <Youtube className="h-4 w-4" />
                YouTube
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={SOCIAL.tiktok} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <TikTokIcon className="h-4 w-4" />
                TikTok
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
