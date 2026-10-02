"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Menu, Mail, X, Instagram, Youtube } from "lucide-react";
import { cn } from "@/lib/utils";
import { PARTNERSHIPS_MAILTO, SOCIAL } from "@/lib/site";
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
  { href: "/workflow", label: "Workflow & Course" },
  { href: "/downloads", label: "Course Access" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/terms", label: "Terms" },
] as const;

/** Space kept above the CTA once the rows above it have slid away. */
const CTA_TOP_GAP_PX = 8;

/**
 * Mobile header that collapses in step with the scroll, like a phone browser's
 * address bar: every pixel scrolled down slides the header up a pixel until
 * only the CTA is left; every pixel scrolled back up brings a pixel back.
 *
 * It moves the header with a transform (via CSS vars on <html>, consumed by the
 * <header> in app/layout.tsx) rather than shrinking it, so the page content
 * never jumps. The offset is capped at scrollY so no gap opens at the top.
 * Writes happen in a rAF with no React render per frame; React only hears
 * about the fully-collapsed boundary. Returns true when fully collapsed.
 */
function useScrollLinkedHeader(ctaRef: React.RefObject<HTMLElement>): boolean {
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const desktop = window.matchMedia("(min-width: 768px)");
    let distance = 0;
    let offset = 0;
    let lastY = Math.max(0, window.scrollY);
    let frame = 0;

    const measure = () => {
      const cta = ctaRef.current;
      // offsetTop is relative to the sticky <header> (its offsetParent).
      distance = cta && !desktop.matches ? Math.max(0, cta.offsetTop - CTA_TOP_GAP_PX) : 0;
    };
    const apply = () => {
      root.style.setProperty("--mobile-header-offset", `${offset}px`);
      root.style.setProperty("--mobile-header-progress", distance ? String(offset / distance) : "0");
      setCollapsed(distance > 0 && offset >= distance);
    };
    const update = () => {
      frame = 0;
      const y = Math.max(0, window.scrollY); // iOS rubber-banding goes negative
      offset = Math.min(Math.max(offset + (y - lastY), 0), distance, y);
      lastY = y;
      apply();
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      update();
    };

    measure();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    desktop.addEventListener("change", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      desktop.removeEventListener("change", onResize);
      if (frame) cancelAnimationFrame(frame);
      root.style.removeProperty("--mobile-header-offset");
      root.style.removeProperty("--mobile-header-progress");
    };
  }, [ctaRef]);
  return collapsed;
}

/** Pages that render the request form inline; elsewhere the CTA goes to the landing page's. */
const PAGES_WITH_FORM = new Set(["/", "/portfolio"]);

export function HeaderNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [drawerEntered, setDrawerEntered] = useState(false);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  const ctaRef = useRef<HTMLDivElement>(null);
  const compact = useScrollLinkedHeader(ctaRef);
  // Keep fully-hidden rows out of the tab order and accessibility tree.
  const collapsibleRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    collapsibleRef.current?.toggleAttribute("inert", compact);
  }, [compact]);

  const onHome = pathname === "/";
  const onPortfolio = pathname.startsWith("/portfolio");
  const onResources = RESOURCE_LINKS.some(
    ({ href }) => pathname === href || pathname.startsWith(href + "/"),
  );
  const ctaHref = PAGES_WITH_FORM.has(pathname) ? "#inquiry" : "/#inquiry";

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
      <div className="md:hidden flex flex-col py-2.5">
        {/* Logo/menu + page nav slide away with the scroll (see useScrollLinkedHeader),
            fading as they go, leaving only the CTA. */}
        <div
          ref={collapsibleRef}
          className="flex flex-col gap-2 pb-2"
          style={{ opacity: "calc(1 - var(--mobile-header-progress, 0))" }}
        >
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
                onHome
                  ? "bg-secondary text-secondary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50 active:bg-muted/70"
              )}
            >
              Home
            </Link>
            <Link
              href="/portfolio"
              className={cn(
                segmentClass,
                onPortfolio
                  ? "bg-secondary text-secondary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50 active:bg-muted/70"
              )}
            >
              Portfolio
            </Link>
          </nav>
        </div>

        {/* What stays pinned once the rows above slide away: contact, two ways. */}
        <div ref={ctaRef} className="flex gap-2">
          <Link
            href={ctaHref}
            className={cn(
              "flex min-h-11 flex-1 items-center justify-center rounded-xl border text-sm font-bold whitespace-nowrap transition-colors [-webkit-tap-highlight-color:transparent]",
              // Solid once it's the only thing left in the bar.
              compact
                ? "border-secondary bg-secondary text-secondary-foreground hover:bg-secondary/90"
                : "border-secondary/40 bg-secondary/10 text-secondary hover:bg-secondary/20"
            )}
          >
            Let&apos;s Work Together
          </Link>
          <a
            href={PARTNERSHIPS_MAILTO}
            className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-4 text-sm font-semibold whitespace-nowrap text-foreground transition-colors hover:bg-muted/50 [-webkit-tap-highlight-color:transparent]"
          >
            <Mail className="h-4 w-4" aria-hidden />
            Email Me
          </a>
        </div>
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
                onHome
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              Home
            </Link>
            <Link
              href="/portfolio"
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                onPortfolio
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              Portfolio
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
            <Link
              href={ctaHref}
              className="ml-1 rounded-md bg-secondary px-3.5 py-2 text-sm font-semibold whitespace-nowrap text-secondary-foreground transition-colors hover:bg-secondary/90"
            >
              Let&apos;s Work Together
            </Link>
            <a
              href={PARTNERSHIPS_MAILTO}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium whitespace-nowrap text-foreground transition-colors hover:bg-muted/50"
            >
              <Mail className="h-4 w-4" aria-hidden />
              Email Me
            </a>
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
                <button
                  type="button"
                  className="mb-4 flex w-full min-h-11 items-center justify-center rounded-xl bg-secondary text-sm font-bold text-secondary-foreground transition-colors hover:bg-secondary/90"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (ctaHref === "#inquiry") {
                      // Wait for the drawer's scroll lock to release before scrolling.
                      setTimeout(() => {
                        document.getElementById("inquiry")?.scrollIntoView({ behavior: "smooth" });
                      }, 50);
                    } else {
                      router.push(ctaHref);
                    }
                  }}
                >
                  Let&apos;s Work Together
                </button>
                <a
                  href={PARTNERSHIPS_MAILTO}
                  className="mb-4 -mt-2 flex w-full min-h-11 items-center justify-center gap-2 rounded-xl border border-border text-sm font-semibold text-foreground transition-colors hover:bg-muted/50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Mail className="h-4 w-4" aria-hidden />
                  Email Me
                </a>
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
