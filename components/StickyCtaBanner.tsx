"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, ArrowRight } from "lucide-react";

interface StickyCtaBannerProps {
  href: string;
  label: string;
  subtext?: string;
}

export function StickyCtaBanner({ href, label, subtext }: StickyCtaBannerProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  if (!visible || dismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="m-3 bg-secondary rounded-2xl shadow-2xl flex items-center gap-3 px-4 py-3">
        <div className="flex-1 min-w-0">
          {subtext && (
            <p className="text-[11px] font-medium text-black/60 mb-1 truncate">{subtext}</p>
          )}
          <Link
            href={href}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-black text-white font-bold py-2.5 text-sm hover:bg-black/80 transition-colors"
          >
            {label}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-black/10 text-black/50 hover:text-black transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
