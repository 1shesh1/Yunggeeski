"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Menu, X, Instagram, Youtube } from "lucide-react";
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

function LogoLink({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "font-semibold tracking-tight text-foreground hover:text-secondary transition-colors shrink-0 min-w-0",
        className
      )}
    >
      Yung<span className="text-secondary">Geeski</span>
    </Link>
  );
}

const RESOURCE_LINKS = [
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/terms", label: "Terms" },
  { href: "/downloads", label: "Course Access" },
  { href: "/orders", label: "Orders" },
] as const;

export function HeaderNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [drawerEntered, setDrawerEntered] = useState(false);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  const onCharts =
    pathname.startsWith("/charts") || pathname.startsWith("/checkout") || pathname.startsWith("/order");
  const onWorkflow = pathname === "/" || pathname.startsWith("/workflow");
  const onResources =
    pathname.startsWith("/about") ||
    pathname.startsWith("/faq") ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/downloads") ||
    pathname.startsWith("/orders");

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      setDrawerEntered(false);
      return;
    }
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setDrawerEntered(true));
    });
    return () => cancelAnimationFrame(id);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [mobileMenuOpen]);

  const segmentClass =
    "flex min-h-11 flex-1 items-center justify-center rounded-lg text-sm font-semibold whitespace-nowrap transition-colors [-webkit-tap-highlight-color:transparent]";

  return (
    <>
      {/* —— Mobile —— */}
      <div className="md:hidden flex flex-col gap-2 py-2.5">
        <div className="flex items-center justify-between gap-3 min-h-11">
          <LogoLink className="text-[0.9375rem] leading-none truncate pr-2" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-11 w-11 shrink-0 rounded-xl text-foreground hover:bg-muted/60"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileMenuOpen((o) => !o)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        <nav
          className="grid w-full grid-cols-2 gap-1 rounded-xl border border-border bg-muted/30 p-1"
          aria-label="Primary navigation"
        >
          <Link
            href="/"
            className={cn(
              segmentClass,
              onWorkflow
                ? "bg-secondary text-secondary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50 active:bg-muted/70"
            )}
          >
            Workflow
          </Link>
          <Link
            href="/charts"
            className={cn(
              segmentClass,
              onCharts
                ? "bg-secondary text-secondary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50 active:bg-muted/70"
            )}
          >
            Charts
          </Link>
        </nav>
      </div>

      {/* —— Desktop —— */}
      <div className="hidden md:flex items-center w-full gap-4 py-4">
        <LogoLink className="text-lg shrink-0" />
        <div className="flex-1 flex justify-center min-w-0">
          <nav className="flex items-center gap-1 min-w-0 flex-wrap justify-center">
            <Link
              href="/"
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
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
                "px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                onCharts
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              Custom Charts
            </Link>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "px-3 py-2 h-auto rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                    onResources
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  Resources
                  <ChevronDown className="ml-1 h-4 w-4 shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={6}
                className="w-48 border-border bg-popover p-1 shadow-xl"
              >
                {RESOURCE_LINKS.map(({ href, label }) => (
                  <DropdownMenuItem
                    key={href}
                    className="cursor-pointer"
                    onSelect={() => router.push(href)}
                  >
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
        <div className="flex items-center gap-3 border-l border-border pl-3 shrink-0">
          <SocialLinks />
        </div>
      </div>

      {/* —— Mobile drawer (portal: header uses backdrop-filter, which breaks fixed descendants) —— */}
      {portalReady &&
        mobileMenuOpen &&
        createPortal(
          <div
            className="md:hidden fixed inset-0 z-[200] animate-in fade-in duration-200"
            role="presentation"
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
              aria-label="Close menu"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div
              id="mobile-nav-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              className={cn(
                "absolute right-0 top-0 flex h-full w-[min(20rem,calc(100vw-2.5rem))] flex-col border-l border-border bg-card shadow-2xl transition-transform duration-300 ease-out will-change-transform",
                drawerEntered ? "translate-x-0" : "translate-x-full"
              )}
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <span className="text-sm font-semibold text-foreground">Menu</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-lg"
                  aria-label="Close menu"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto px-3 py-4">
                <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Resources
                </p>
                <ul className="flex flex-col gap-1">
                  {RESOURCE_LINKS.map(({ href, label }) => (
                    <li key={href}>
                      <button
                        type="button"
                        className={cn(
                          "flex w-full min-h-11 items-center rounded-lg px-3 text-left text-sm font-medium transition-colors",
                          pathname === href || pathname.startsWith(href + "/")
                            ? "bg-secondary/15 text-secondary"
                            : "text-foreground hover:bg-muted/60"
                        )}
                        onClick={() => {
                          setMobileMenuOpen(false);
                          router.push(href);
                        }}
                      >
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>

                <p className="mb-2 mt-6 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Follow
                </p>
                <div className="flex flex-wrap gap-2 px-1">
                  <a
                    href={SOCIAL.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-muted/20 text-muted-foreground transition-colors hover:border-secondary/40 hover:text-secondary"
                    aria-label="Instagram"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a
                    href={SOCIAL.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-muted/20 text-muted-foreground transition-colors hover:border-secondary/40 hover:text-secondary"
                    aria-label="YouTube"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Youtube className="h-5 w-5" />
                  </a>
                  <a
                    href={SOCIAL.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-muted/20 text-muted-foreground transition-colors hover:border-secondary/40 hover:text-secondary"
                    aria-label="TikTok"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <TikTokIcon className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
