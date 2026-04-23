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
          </div>

          {/* Workflow */}
          <div>
            <h3 className="font-semibold text-foreground text-sm mb-3">Workflow</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/#tier1" className={linkClass}>
                  Ideas
                </Link>
              </li>
              <li>
                <Link href="/#tier2" className={linkClass}>
                  Ideas + System
                </Link>
              </li>
              <li>
                <Link href="/#tier3" className={linkClass}>
                  Full Package
                </Link>
              </li>
              <li>
                <Link href="/workflow/access" className={linkClass}>
                  Access
                </Link>
              </li>
            </ul>
          </div>

          {/* Charts */}
          <div>
            <h3 className="font-semibold text-foreground text-sm mb-3">Charts</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/charts" className={linkClass}>
                  Overview
                </Link>
              </li>
              <li>
                <Link href="/checkout/basic" className={linkClass}>
                  Basic
                </Link>
              </li>
              <li>
                <Link href="/checkout/standard" className={linkClass}>
                  Standard
                </Link>
              </li>
              <li>
                <Link href="/checkout/premium" className={linkClass}>
                  Premium
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
