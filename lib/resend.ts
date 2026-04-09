/**
 * Resend transactional emails.
 * In MOCK_MODE or when RESEND_API_KEY is missing, log payload to console instead of sending.
 */

import { Resend } from "resend";
import { MOCK_MODE, getResendApiKey, getResendFromEmail, getResendAdminEmail } from "./env";

let resend: Resend | null = null;

function getResend(): Resend | null {
  if (resend) return resend;
  const key = getResendApiKey();
  if (!key) return null;
  resend = new Resend(key);
  return resend;
}

export function isResendAvailable(): boolean {
  return !MOCK_MODE && getResend() !== null;
}

export interface OrderSummary {
  orderId: string;
  tier: string;
  customerEmail: string;
  chartTitle?: string;
  resolution?: string;
}

export async function sendCustomerConfirmation(order: OrderSummary): Promise<boolean> {
  const from = getResendFromEmail();
  const html = `
    <h1>Order Confirmed</h1>
    <p>Thank you for your order. We've received your details and will begin production.</p>
    <p><strong>Order ID:</strong> ${order.orderId}</p>
    <p><strong>Tier:</strong> ${order.tier}</p>
    ${order.chartTitle ? `<p><strong>Chart:</strong> ${order.chartTitle}</p>` : ""}
    <p>We'll deliver within the timeline for your package. If you have questions, reply to this email.</p>
  `;

  if (MOCK_MODE || !getResend()) {
    console.log("[MOCK EMAIL] Customer confirmation:", { to: order.customerEmail, from, html: html.slice(0, 200) });
    return true;
  }

  const { error } = await getResend()!.emails.send({
    from,
    to: order.customerEmail,
    subject: `Order ${order.orderId} — Data-Driven Financial Charts`,
    html,
  });
  return !error;
}

export async function sendAdminOrderSummary(order: OrderSummary): Promise<boolean> {
  const from = getResendFromEmail();
  const adminEmail = getResendAdminEmail();
  const html = `
    <h1>New Order</h1>
    <p><strong>Order ID:</strong> ${order.orderId}</p>
    <p><strong>Tier:</strong> ${order.tier}</p>
    <p><strong>Customer:</strong> ${order.customerEmail}</p>
    ${order.chartTitle ? `<p><strong>Chart:</strong> ${order.chartTitle}</p>` : ""}
    ${order.resolution ? `<p><strong>Resolution:</strong> ${order.resolution}</p>` : ""}
  `;

  if (MOCK_MODE || !getResend()) {
    console.log("[MOCK EMAIL] Admin order summary:", { to: adminEmail, from, html: html.slice(0, 200) });
    return true;
  }

  const { error } = await getResend()!.emails.send({
    from,
    to: adminEmail,
    subject: `New order: ${order.orderId}`,
    html,
  });
  return !error;
}
