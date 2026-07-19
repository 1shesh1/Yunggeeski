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

export interface BrandInquiryPayload {
  name: string;
  company: string;
  workEmail: string;
  companyWebsite: string;
  productOrService: string;
  campaignObjective: string;
  budget: string;
  launchDate: string;
  deliverables: string;
  paidAdsRequired: boolean;
  categoryExclusivityRequired: boolean;
  additionalInfo?: string | null;
}

/** Escape user-supplied text before interpolating into the notification HTML. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Notify the partnerships inbox of a new brand campaign inquiry.
 * Sends to PARTNERSHIPS_EMAIL with the applicant's work email as reply-to.
 */
export async function sendBrandInquiryEmail(
  payload: BrandInquiryPayload,
): Promise<{ ok: boolean; error?: string }> {
  const apiKey = getResendApiKey();
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY not set" };
  }

  const from = getResendFromEmail();
  const rows: [string, string][] = [
    ["Name", payload.name],
    ["Company", payload.company],
    ["Work email", payload.workEmail],
    ["Website", payload.companyWebsite],
    ["Product / service", payload.productOrService],
    ["Campaign objective", payload.campaignObjective],
    ["Budget", budgetLabel(payload.budget)],
    ["Desired launch", payload.launchDate],
    ["Deliverables", payload.deliverables],
    ["Paid ads usage required", payload.paidAdsRequired ? "Yes" : "No"],
    ["Category exclusivity required", payload.categoryExclusivityRequired ? "Yes" : "No"],
    ["Additional info", payload.additionalInfo?.trim() || "—"],
  ];

  const rowsHtml = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#666;vertical-align:top;white-space:nowrap;"><strong>${escapeHtml(label)}</strong></td><td style="padding:4px 0;white-space:pre-wrap;">${escapeHtml(value)}</td></tr>`,
    )
    .join("");

  const subject = `New campaign inquiry — ${payload.company}`;
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: system-ui, sans-serif; line-height: 1.6; color: #333; max-width: 640px;">
  <h1 style="font-size: 1.25rem;">New brand campaign inquiry</h1>
  <table style="border-collapse: collapse; font-size: 0.9rem;">${rowsHtml}</table>
</body>
</html>
  `.trim();

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: PARTNERSHIPS_EMAIL,
      reply_to: payload.workEmail,
      subject,
      html,
    });
    if (error) {
      console.error("[email] Brand inquiry Resend error:", error);
      return { ok: false, error: String(error.message ?? error) };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[email] Brand inquiry send failed:", message);
    return { ok: false, error: message };
  }
}
