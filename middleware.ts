import { NextRequest, NextResponse } from "next/server";

/**
 * Maintenance mode — FAIL-CLOSED.
 *
 * The public sees a maintenance page by DEFAULT: maintenance is active unless
 * MAINTENANCE_MODE is explicitly set to a disabling value ("off" / "false" /
 * "0" / "disabled" / "no"). So a fresh deploy with no env config holds the
 * release automatically. To GO LIVE: set MAINTENANCE_MODE=off and redeploy so
 * the edge runtime picks up the new value.
 *
 * Team bypass: visit /?preview=<MAINTENANCE_BYPASS_TOKEN>. That sets a cookie so
 * you (and only you) see the live site while the public sees maintenance.
 */

const DISABLED_VALUES = new Set(["off", "false", "0", "disabled", "no"]);

// Self-authenticated machine endpoints that must keep working during the hold
// (never public-facing UI): the Stripe webhook and the secret-gated metrics cron.
const ALLOW_PREFIXES = ["/api/stripe/webhook", "/api/cron/"];

const BYPASS_COOKIE = "yg_maint_bypass";
const BYPASS_QUERY = "preview";
const BYPASS_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function maintenanceActive(): boolean {
  const v = process.env.MAINTENANCE_MODE?.trim().toLowerCase();
  return v === undefined || v === "" || !DISABLED_VALUES.has(v);
}

/** Length-safe constant-time-ish string compare (edge runtime has no timingSafeEqual). */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function maintenanceHtml(): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>Down for maintenance — YungGeeski</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  html, body { margin: 0; height: 100%; }
  body {
    background: #000; color: #fafafa;
    font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
    display: flex; align-items: center; justify-content: center; padding: 24px;
    background-image: radial-gradient(60% 50% at 50% 0%, rgba(89,187,255,0.10), transparent 70%);
  }
  .card { max-width: 30rem; text-align: center; }
  .badge {
    display: inline-block; font-size: 12px; font-weight: 600; letter-spacing: .12em;
    text-transform: uppercase; color: #59bbff; border: 1px solid rgba(89,187,255,.3);
    background: rgba(89,187,255,.1); border-radius: 999px; padding: 6px 14px; margin-bottom: 22px;
  }
  h1 { font-size: clamp(1.6rem, 5vw, 2.4rem); line-height: 1.15; margin: 0 0 14px; }
  h1 .accent { color: #59bbff; }
  p { color: rgba(250,250,250,.65); line-height: 1.6; margin: 0 auto; max-width: 24rem; }
  .brand { margin-top: 34px; font-weight: 600; letter-spacing: -.01em; color: rgba(250,250,250,.9); }
  .brand span { color: #59bbff; }
</style>
</head>
<body>
  <main class="card">
    <div class="badge">Scheduled maintenance</div>
    <h1>We&#39;ll be back <span class="accent">shortly</span></h1>
    <p>YungGeeski is getting an update. The site is briefly offline while we put the finishing touches in place — check back soon.</p>
    <div class="brand">Yung<span>Geeski</span></div>
  </main>
</body>
</html>`;
}

export function middleware(request: NextRequest) {
  if (!maintenanceActive()) return NextResponse.next();

  const { pathname, searchParams } = request.nextUrl;

  // Always allow self-authenticated machine endpoints through.
  if (ALLOW_PREFIXES.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const token = process.env.MAINTENANCE_BYPASS_TOKEN?.trim();
  if (token) {
    // Grant a bypass via ?preview=<token>: set the cookie, redirect to a clean URL.
    const preview = searchParams.get(BYPASS_QUERY);
    if (preview && safeEqual(preview, token)) {
      const url = request.nextUrl.clone();
      url.searchParams.delete(BYPASS_QUERY);
      const res = NextResponse.redirect(url);
      res.cookies.set(BYPASS_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: BYPASS_MAX_AGE,
      });
      return res;
    }
    // Already-bypassed visitors pass through.
    const cookie = request.cookies.get(BYPASS_COOKIE)?.value;
    if (cookie && safeEqual(cookie, token)) return NextResponse.next();
  }

  // Public request during maintenance.
  const headers: Record<string, string> = { "Cache-Control": "no-store", "Retry-After": "3600" };
  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "Service temporarily unavailable for maintenance." },
      { status: 503, headers },
    );
  }
  return new NextResponse(maintenanceHtml(), {
    status: 503,
    headers: { ...headers, "Content-Type": "text/html; charset=utf-8" },
  });
}

export const config = {
  // Run on everything except Next internals and the favicon (static assets and
  // machine endpoints are handled above). This keeps the middleware off the hot
  // path for bundled JS/CSS while still gating all pages + API routes.
  matcher: ["/((?!_next/static|_next/image|favicon.png).*)"],
};
