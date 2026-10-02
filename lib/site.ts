// Shared site links and contact — used in header, footer, emails, etc.

/**
 * Where campaign requests land, and the address brands are told to expect a
 * reply from. Shown publicly in the footer and on /about.
 */
export const PARTNERSHIPS_EMAIL = "yunggeeski1@gmail.com";

/**
 * Prefilled "Email Me" link for brand outreach. Opens the visitor's mail app
 * addressed to PARTNERSHIPS_EMAIL — the zero-friction alternative to the form.
 */
export const PARTNERSHIPS_MAILTO = `mailto:${PARTNERSHIPS_EMAIL}?subject=${encodeURIComponent(
  "Collaboration inquiry",
)}`;

/** Anchor of the contact section (Email Me + inquiry form). Rendered on the landing page and /portfolio. */
export const INQUIRY_ANCHOR = "inquiry";

export const SOCIAL = {
  instagram: "https://instagram.com/yunggeeski_",
  youtube: "https://youtube.com/@yunggeeski",
  tiktok: "https://tiktok.com/@yunggeeski",
} as const;
