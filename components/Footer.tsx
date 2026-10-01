import Link from "next/link";
import { PARTNERSHIPS_EMAIL, SOCIAL } from "@/lib/site";

const linkClass =
  "text-sm text-muted-foreground hover:text-foreground transition-colors block";

export function Footer() {
  return (
    <footer className="border-t py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 md:gap-6">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="font-semibold text-lg text-foreground hover:text-secondary transition-colors"
            >
              Yung<span className="text-secondary">Geeski</span>
            </Link>
            <Link
              href="/#inquiry"
              className="mt-4 inline-flex items-center rounded-lg border border-secondary/40 bg-secondary/10 px-3 py-1.5 text-xs font-semibold text-secondary transition-colors hover:bg-secondary/20"
            >
              Request a Campaign
            </Link>
          </div>

          {/* Brands */}
          <div>
            <h3 className="font-semibold text-foreground text-sm mb-3">For Brands</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/portfolio" className={linkClass}>
                  Portfolio
                </Link>
              </li>
              <li>
                <Link href="/#case-study" className={linkClass}>
                  Case Study
                </Link>
              </li>
              <li>
                <Link href="/#services" className={linkClass}>
                  What You Get
                </Link>
              </li>
              <li>
                <Link href="/#inquiry" className={linkClass}>
                  Request a Campaign
                </Link>
              </li>
            </ul>
          </div>

          {/* Workflow */}
          <div>
            <h3 className="font-semibold text-foreground text-sm mb-3">Workflow</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/workflow" className={linkClass}>
                  Course Overview
                </Link>
              </li>
              <li>
                <Link href="/workflow#pricing" className={linkClass}>
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/workflow/access" className={linkClass}>
                  Access
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-foreground text-sm mb-3">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className={linkClass}>
                  About
                </Link>
              </li>
              <li>
                <Link href="/faq" className={linkClass}>
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/terms" className={linkClass}>
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/downloads" className={linkClass} title="Sign in with your purchase email">
                  Course Access
                </Link>
              </li>
            </ul>
          </div>

          {/* Follow & Contact */}
          <div>
            <h3 className="font-semibold text-foreground text-sm mb-3">Follow</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href={SOCIAL.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  YouTube
                </a>
              </li>
              <li>
                <a
                  href={SOCIAL.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href={SOCIAL.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  TikTok
                </a>
              </li>
            </ul>
            <h3 className="font-semibold text-foreground text-sm mt-4 mb-3">Contact</h3>
            <a href={`mailto:${PARTNERSHIPS_EMAIL}`} className={linkClass}>
              {PARTNERSHIPS_EMAIL}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
