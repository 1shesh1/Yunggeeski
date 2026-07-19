// Netlify scheduled function: pings the internal metrics-refresh route once a
// day. The actual TikTok/Instagram fetch + persistence lives in the Next.js
// route (app/api/cron/refresh-metrics) so it shares the app's env and libs.
//
// Schedule is declared in netlify.toml ([functions."refresh-metrics-cron"]).
// No-ops safely if METRICS_REFRESH_SECRET is unset.

import type { Config } from "@netlify/functions";

export default async (_req: Request) => {
  const secret = process.env.METRICS_REFRESH_SECRET;
  if (!secret) {
    console.info("[refresh-metrics-cron] METRICS_REFRESH_SECRET unset — skipping");
    return new Response("skipped", { status: 200 });
  }

  const base =
    process.env.URL ?? process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const target = `${base.replace(/\/$/, "")}/api/cron/refresh-metrics`;

  try {
    const res = await fetch(target, {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}` },
    });
    const body = await res.text();
    console.info(`[refresh-metrics-cron] ${res.status}: ${body.slice(0, 300)}`);
    return new Response(body, { status: res.status });
  } catch (e) {
    console.error("[refresh-metrics-cron] failed:", e);
    return new Response("error", { status: 500 });
  }
};

export const config: Config = {
  // Schedule also set in netlify.toml; kept here for clarity/portability.
  schedule: "@daily",
};
