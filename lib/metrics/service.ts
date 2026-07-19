/**
 * Public read API for social metrics used by the /brands sponsor page.
 *
 * The page imports ONLY from here. Today it returns provisional fixtures with a
 * `source: "fallback"` flag. Issue #4 will implement the live→snapshot→override
 * chain (TikTok Display API + Instagram Graph API behind a Supabase cache) and
 * swap the bodies below — the return shapes stay identical, so no page changes
 * are needed.
 */

import type { AccountMetrics, MetricsResult, PortfolioPost } from "./types";
import { FALLBACK_ACCOUNT_METRICS, FALLBACK_PORTFOLIO } from "./fixtures";

/** Headline account metrics for the hero proof line + performance row. */
export async function getAccountMetrics(): Promise<MetricsResult<AccountMetrics>> {
  // TODO(#4): read latest cached snapshot from Supabase; fall back to override,
  // then to these fixtures. For now, always fixtures.
  return {
    data: FALLBACK_ACCOUNT_METRICS,
    source: "fallback",
    asOf: null,
  };
}

/** The six featured portfolio posts for the performance grid. */
export async function getFeaturedPortfolio(
  limit = 6,
): Promise<MetricsResult<PortfolioPost[]>> {
  // TODO(#4): read `is_featured` posts ordered by `sort_order` from Supabase.
  return {
    data: FALLBACK_PORTFOLIO.slice(0, limit),
    source: "fallback",
    asOf: null,
  };
}
