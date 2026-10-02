/**
 * Order confirmation email via Resend.
 * Only sends when RESEND_API_KEY is set (non–mock mode).
 */

import { Resend } from "resend";
import { getResendApiKey, getResendFromEmail, getBaseUrl } from "./env";
import { PARTNERSHIPS_EMAIL } from "./site";
import { budgetLabel } from "./schemas";

export interface OrderConfirmationPayload {
  /** Customer email address */
  to: string;
  /** Tier display name (e.g. "Basic", "Standard", "Premium") */
  tierName: string;
  /** Total charged in cents */
  amountTotalCents: number;
  /** Whether they already submitted the form (in_production) or need to (awaiting_form) */
  orderStatus: "in_production" | "awaiting_form";
  /** Stripe Checkout session ID for the order status link */
  sessionId: string;
}

function formatAmount(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export async function sendOrderConfirmationEmail(
  payload: OrderConfirmationPayload
): Promise<{ ok: boolean; error?: string }> {
  const apiKey = getResendApiKey();
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY not set" };
  }

  const from = getResendFromEmail();
  const baseUrl = getBaseUrl();
  const orderStatusUrl = `${baseUrl}/order/success?session_id=${encodeURIComponent(payload.sessionId)}`;

  const isAwaitingForm = payload.orderStatus === "awaiting_form";
  const nextStep = isAwaitingForm
    ? `Complete your order details so we can get started: ${orderStatusUrl}`
    : `We've received your details. Track your order here: ${orderStatusUrl}`;

  const subject = `Order confirmed — ${payload.tierName} · YungGeeski`;
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: system-ui, sans-serif; line-height: 1.6; color: #333; max-width: 560px;">
  <h1 style="font-size: 1.25rem;">Thanks for your order</h1>
  <p>Your payment has been confirmed.</p>
  <ul style="list-style: none; padding: 0;">
    <li><strong>Package:</strong> ${payload.tierName}</li>
    <li><strong>Amount:</strong> ${formatAmount(payload.amountTotalCents)}</li>
  </ul>
  <p>${nextStep}</p>
  <p style="margin-top: 2rem; font-size: 0.875rem; color: #666;">
    If you have any questions, reply to this email.
  </p>
</body>
</html>
  `.trim();

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from,
      to: payload.to,
      subject,
      html,
    });
    if (error) {
      console.error("[email] Resend error:", error);
      return { ok: false, error: String(error.message ?? error) };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[email] Send failed:", message);
    return { ok: false, error: message };
  }
}

export async function sendCoursePurchaseConfirmationEmail(params: {
  to: string;
  tierName: string;
  accessUrl: string;
}): Promise<{ ok: boolean; error?: string }> {
  const apiKey = getResendApiKey();
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY not set" };
  }

  const from = getResendFromEmail();
  const subject = `Course confirmed — ${params.tierName} · YungGeeski`;
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: system-ui, sans-serif; line-height: 1.6; color: #333; max-width: 560px;">
  <h1 style="font-size: 1.25rem;">You&apos;re in</h1>
  <p>Thanks for your purchase of <strong>${params.tierName}</strong>.</p>
  <p>Visit the course access page and use the same email you used at checkout to request a sign-in link anytime:</p>
  <p><a href="${params.accessUrl}" style="color: #59bbff;">Open course access</a></p>
  <p style="margin-top: 2rem; font-size: 0.875rem; color: #666;">
    If you have any questions, reply to this email.
  </p>
</body>
</html>
  `.trim();

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: params.to,
      subject,
      html,
    });
    if (error) {
      console.error("[email] Course confirmation Resend error:", error);
      return { ok: false, error: String(error.message ?? error) };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[email] Course confirmation send failed:", message);
    return { ok: false, error: message };
  }
}

export async function sendCourseAccessMagicLinkEmail(params: {
  to: string;
  magicLinkUrl: string;
}): Promise<{ ok: boolean; error?: string }> {
  const apiKey = getResendApiKey();
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY not set" };
  }

  const from = getResendFromEmail();
  const subject = "Your course access link · YungGeeski";
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: system-ui, sans-serif; line-height: 1.6; color: #333; max-width: 560px;">
  <h1 style="font-size: 1.25rem;">Sign in to your course</h1>
  <p>Click the link below to unlock your materials. It expires in one hour.</p>
  <p><a href="${params.magicLinkUrl}" style="color: #59bbff;">Access my course</a></p>
  <p style="margin-top: 2rem; font-size: 0.875rem; color: #666;">
    If you didn&apos;t request this, you can ignore this email.
  </p>
</body>
</html>
  `.trim();

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: params.to,
      subject,
      html,
    });
    if (error) {
      console.error("[email] Magic link Resend error:", error);
      return { ok: false, error: String(error.message ?? error) };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }
}

// —— Brand campaign requests ——

export interface BrandInquiryPayload {
  name: string;
  company: string;
  workEmail: string;
  /** What they'd like to work on together — the one required free-text field. */
  collaboration: string;
  // Optional campaign details: null when the submitter skipped them.
  companyWebsite: string | null;
  productOrService: string | null;
  budget: string | null;
  launchDate: string | null;
  deliverables: string | null;
  paidAdsRequired: "yes" | "no" | null;
  categoryExclusivityRequired: "yes" | "no" | null;
  additionalInfo?: string | null;
}

const yesNo = (v: "yes" | "no" | null) => (v === "yes" ? "Yes" : v === "no" ? "No" : null);

/**
 * The optional details the submitter actually filled in, as label/value
 * pairs (plain text). Empty when they sent only the short form.
 */
function providedDetails(payload: BrandInquiryPayload): [string, string][] {
  const rows: [string, string | null][] = [
    ["Budget", payload.budget ? budgetLabel(payload.budget) : null],
    ["Desired launch", payload.launchDate ? formatLaunchDate(payload.launchDate) : null],
    ["Product / service", payload.productOrService],
    ["Deliverables", payload.deliverables],
    ["Paid ads usage", yesNo(payload.paidAdsRequired)],
    ["Category exclusivity", yesNo(payload.categoryExclusivityRequired)],
  ];
  return rows.filter((r): r is [string, string] => Boolean(r[1]));
}

const ACCENT = "#59bbff";
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/** Escape user-supplied text before interpolating into email HTML. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Escaped, with line breaks kept (email clients ignore white-space: pre-wrap inconsistently). */
function escapeMultiline(value: string): string {
  return escapeHtml(value.trim()).replace(/\r?\n/g, "<br>");
}

/** "company.com" -> "https://company.com"; null for anything that isn't http(s). */
function websiteHref(raw: string): string | null {
  const trimmed = raw.trim();
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

/** "2026-11-15" -> "Sun, Nov 15, 2026 · in 45 days". Falls back to the raw string. */
function formatLaunchDate(raw: string): string {
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return raw;
  const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  const label = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const days = Math.round((date.getTime() - today) / 86_400_000);
  const rel =
    days === 0 ? "today" : days > 0 ? `in ${days} day${days === 1 ? "" : "s"}` : "date has passed";
  return `${label} · ${rel}`;
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name.trim();
}

/** Give a bare EMAIL_FROM address a display name so it doesn't read as a raw address. */
function brandedFrom(): string {
  const from = getResendFromEmail();
  return from.includes("<") ? from : `Yung Geeski <${from}>`;
}

/** Shared Resend call for the brand emails. Self-guards when no API key is set. */
async function sendBrandEmail(
  tag: string,
  message: { to: string; subject: string; html: string; text: string; replyTo: string },
): Promise<{ ok: boolean; error?: string }> {
  const apiKey = getResendApiKey();
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY not set" };
  }
  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: brandedFrom(),
      to: message.to,
      reply_to: message.replyTo,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });
    if (error) {
      console.error(`[email] ${tag} Resend error:`, error);
      return { ok: false, error: String(error.message ?? error) };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[email] ${tag} send failed:`, message);
    return { ok: false, error: message };
  }
}

/** Outer shell shared by both brand emails: centered 600px card on a light background. */
function emailShell(preheader: string, inner: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:${FONT};color:#1a1a1a;">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
${inner}
</table>
<p style="margin:16px 0 0;font-size:12px;color:#9ca3af;">Yung Geeski · Financial visual-content studio</p>
</td></tr>
</table>
</body>
</html>`;
}

function sectionHeading(title: string): string {
  return `<tr><td style="padding:24px 28px 8px;"><p style="margin:0;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:${ACCENT};">${escapeHtml(title)}</p></td></tr>`;
}

/** Label/value rows. Values are pre-escaped HTML (so links can be passed in). */
function fieldRows(rows: [string, string][]): string {
  const body = rows
    .map(
      ([label, valueHtml]) => `<tr>
<td style="padding:8px 16px 8px 0;width:150px;vertical-align:top;font-size:13px;color:#6b7280;">${escapeHtml(label)}</td>
<td style="padding:8px 0;vertical-align:top;font-size:14px;line-height:1.55;color:#111827;">${valueHtml}</td>
</tr>`,
    )
    .join("");
  return `<tr><td style="padding:0 28px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f0f1f3;">${body}</table></td></tr>`;
}

/**
 * Notify the campaign inbox (PARTNERSHIPS_EMAIL) of a new request. Laid out for
 * triage: the decision-driving facts (budget, launch, rights) up top, then
 * contact, campaign detail, and notes. Reply-to is the brand, so hitting reply
 * answers them directly.
 */
export async function sendBrandInquiryEmail(
  payload: BrandInquiryPayload,
): Promise<{ ok: boolean; error?: string }> {
  const details = providedDetails(payload);
  const budget = payload.budget ? budgetLabel(payload.budget) : null;
  const notes = payload.additionalInfo?.trim() || "";
  const site = payload.companyWebsite ? websiteHref(payload.companyWebsite) : null;
  const submitted = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Chicago",
  });
  const replySubject = encodeURIComponent(`Re: your inquiry — ${payload.company}`);
  const mailto = `mailto:${encodeURIComponent(payload.workEmail)}?subject=${replySubject}`;

  const contactRows: [string, string][] = [
    ["Name", escapeHtml(payload.name)],
    [
      "Email",
      `<a href="mailto:${escapeHtml(payload.workEmail)}" style="color:#0369a1;">${escapeHtml(payload.workEmail)}</a>`,
    ],
    ["Company", escapeHtml(payload.company)],
  ];
  if (payload.companyWebsite) {
    contactRows.push([
      "Website",
      site
        ? `<a href="${escapeHtml(site)}" style="color:#0369a1;">${escapeHtml(payload.companyWebsite)}</a>`
        : escapeHtml(payload.companyWebsite),
    ]);
  }

  const inner = `
<tr><td style="background:#0b0b0c;padding:24px 28px;">
<p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:${ACCENT};">New collaboration inquiry</p>
<h1 style="margin:0;font-size:24px;line-height:1.25;color:#ffffff;">${escapeHtml(payload.company)}</h1>
<p style="margin:6px 0 0;font-size:13px;color:#a1a1aa;">from ${escapeHtml(payload.name)} · ${escapeHtml(submitted)} CT</p>
</td></tr>
${sectionHeading("What they have in mind")}
<tr><td style="padding:4px 28px 4px;font-size:15px;line-height:1.6;color:#111827;">${escapeMultiline(payload.collaboration)}</td></tr>
<tr><td style="padding:18px 28px 4px;">
<a href="${mailto}" style="display:inline-block;background:${ACCENT};color:#000000;font-weight:700;font-size:14px;text-decoration:none;padding:12px 20px;border-radius:8px;">Reply to ${escapeHtml(firstName(payload.name))}</a>
</td></tr>
${sectionHeading("Contact")}
${fieldRows(contactRows)}
${
  details.length
    ? `${sectionHeading("Campaign details")}${fieldRows(details.map(([l, v]) => [l, escapeMultiline(v)]))}`
    : ""
}
${notes ? `${sectionHeading("Additional notes")}${fieldRows([["Notes", escapeMultiline(notes)]])}` : ""}
<tr><td style="padding:24px 28px;">
<p style="margin:0;font-size:12px;line-height:1.5;color:#6b7280;">Replying to this email goes straight to ${escapeHtml(payload.workEmail)}. They've been sent a confirmation saying you'll be in touch from ${escapeHtml(PARTNERSHIPS_EMAIL)}.</p>
</td></tr>`;

  const text = [
    `NEW COLLABORATION INQUIRY — ${payload.company}`,
    `Submitted ${submitted} CT`,
    "",
    "WHAT THEY HAVE IN MIND",
    payload.collaboration.trim(),
    "",
    "CONTACT",
    `Name:    ${payload.name}`,
    `Email:   ${payload.workEmail}`,
    `Company: ${payload.company}`,
    ...(payload.companyWebsite ? [`Website: ${payload.companyWebsite}`] : []),
    ...(details.length
      ? ["", "CAMPAIGN DETAILS", ...details.map(([l, v]) => `${l}: ${v.trim()}`)]
      : []),
    ...(notes ? ["", "ADDITIONAL NOTES", notes] : []),
    "",
    `Reply to this email to respond to ${payload.name} directly.`,
  ].join("\n");

  return sendBrandEmail("Brand inquiry", {
    to: PARTNERSHIPS_EMAIL,
    replyTo: payload.workEmail,
    subject: `New inquiry: ${payload.company}${budget ? ` · ${budget}` : ""}`,
    html: emailShell(`${payload.name} · ${payload.collaboration.trim().slice(0, 90)}`, inner),
    text,
  });
}

/**
 * Confirm receipt to the brand and set expectations: they'll hear back from
 * PARTNERSHIPS_EMAIL. Reply-to is that inbox, so a reply here reaches us too.
 */
export async function sendBrandInquiryConfirmationEmail(
  payload: BrandInquiryPayload,
): Promise<{ ok: boolean; error?: string }> {
  const name = firstName(payload.name);
  const details = providedDetails(payload);
  const portfolioUrl = `${getBaseUrl()}/portfolio`;

  const step = (n: number, html: string) => `<tr>
<td style="padding:6px 12px 6px 0;width:28px;vertical-align:top;"><div style="width:24px;height:24px;border-radius:12px;background:#e0f2fe;color:#0369a1;font-size:12px;font-weight:700;text-align:center;line-height:24px;">${n}</div></td>
<td style="padding:6px 0;vertical-align:top;font-size:14px;line-height:1.55;color:#374151;">${html}</td>
</tr>`;

  const inner = `
<tr><td style="background:#0b0b0c;padding:24px 28px;">
<p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;">Yung<span style="color:${ACCENT};">Geeski</span></p>
</td></tr>
<tr><td style="padding:28px 28px 8px;">
<h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:#111827;">Thanks, ${escapeHtml(name)} — your message is in.</h1>
<p style="margin:0;font-size:15px;line-height:1.6;color:#374151;">We've received your message about <strong>${escapeHtml(payload.company)}</strong> and it's being reviewed now. You'll be contacted soon from <a href="mailto:${escapeHtml(PARTNERSHIPS_EMAIL)}" style="color:#0369a1;font-weight:600;">${escapeHtml(PARTNERSHIPS_EMAIL)}</a>.</p>
</td></tr>
${sectionHeading("What happens next")}
<tr><td style="padding:0 28px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${step(1, "We read through what you have in mind and how it might fit.")}
${step(2, `You'll hear from <strong>${escapeHtml(PARTNERSHIPS_EMAIL)}</strong>. Add it to your contacts so our reply doesn't land in spam.`)}
${step(3, "If it's a fit, we'll set up a quick call and scope the details from there.")}
</table></td></tr>
${sectionHeading("Your message")}
${fieldRows([
  ["Company", escapeHtml(payload.company)],
  ["Message", escapeMultiline(payload.collaboration)],
  ...details.map(([l, v]): [string, string] => [l, escapeMultiline(v)]),
])}
<tr><td style="padding:24px 28px 28px;">
<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#374151;">Need to add something? Just reply to this email.</p>
<a href="${escapeHtml(portfolioUrl)}" style="display:inline-block;border:1px solid #d1d5db;color:#111827;font-weight:600;font-size:14px;text-decoration:none;padding:11px 18px;border-radius:8px;">Browse the portfolio</a>
</td></tr>`;

  const text = [
    `Thanks, ${name} — your message is in.`,
    "",
    `We've received your message about ${payload.company} and it's being reviewed now. You'll be contacted soon from ${PARTNERSHIPS_EMAIL}.`,
    "",
    "WHAT HAPPENS NEXT",
    "1. We read through what you have in mind and how it might fit.",
    `2. You'll hear from ${PARTNERSHIPS_EMAIL}. Add it to your contacts so our reply doesn't land in spam.`,
    "3. If it's a fit, we'll set up a quick call and scope the details from there.",
    "",
    "YOUR MESSAGE",
    `Company: ${payload.company}`,
    payload.collaboration.trim(),
    ...details.map(([l, v]) => `${l}: ${v.trim()}`),
    "",
    "Need to add something? Just reply to this email.",
    `Portfolio: ${portfolioUrl}`,
  ].join("\n");

  return sendBrandEmail("Brand inquiry confirmation", {
    to: payload.workEmail,
    replyTo: PARTNERSHIPS_EMAIL,
    subject: "Thanks for reaching out — Yung Geeski",
    html: emailShell(`You'll hear from ${PARTNERSHIPS_EMAIL} soon.`, inner),
    text,
  });
}
