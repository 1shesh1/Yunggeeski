/**
 * Stripe Checkout session creation.
 * In MOCK_MODE or when STRIPE_SECRET_KEY is missing, do not call Stripe API.
 */

import Stripe from "stripe";
import { MOCK_MODE, getStripeSecretKey, getBaseUrl } from "./env";
import type { TierId } from "./pricing";
import type { AddOnId } from "./pricing";
import { TIERS, ADDONS, STRIPE_PRICE_KEYS } from "./pricing";
import { getStripePriceId } from "./env";
import type { CourseTierId } from "./course";
import { COURSE_STRIPE_PRICE_ENV_KEYS, COURSE_TIER_SALES } from "./course";

/** Stripe Checkout requires Price IDs (price_xxx), not Product IDs (prod_xxx). */
function ensurePriceId(priceId: string | undefined, context: string): string | undefined {
  if (!priceId) return undefined;
  if (priceId.startsWith("prod_")) {
    throw new Error(
      `Stripe expects a Price ID (starts with price_), not a Product ID (prod_). ${context}: you used a product ID. In Stripe Dashboard go to Product → copy the Price ID (price_...) and set that in your env.`
    );
  }
  return priceId;
}

// TODO: Initialize with real key in production when MOCK_MODE=false
let stripe: Stripe | null = null;

function getStripe(): Stripe | null {
  if (stripe) return stripe;
  const key = getStripeSecretKey();
  if (!key) return null;
  // STRIPE_SECRET_KEY must be the Secret API key (sk_test_... or sk_live_...), not a Price ID
  if (key.startsWith("price_") || key.startsWith("prod_")) {
    throw new Error(
      "STRIPE_SECRET_KEY must be your Stripe Secret API key (starts with sk_test_ or sk_live_), not a Price ID. In Stripe Dashboard go to Developers → API keys and copy the Secret key. Use price_ IDs only for STRIPE_PRICE_* and STRIPE_ADDON_* env vars."
    );
  }
  if (!key.startsWith("sk_")) {
    throw new Error(
      "STRIPE_SECRET_KEY should start with sk_test_ or sk_live_. Get it from Stripe Dashboard → Developers → API keys (Secret key)."
    );
  }
  stripe = new Stripe(key, { apiVersion: "2023-10-16" });
  return stripe;
}

export function isStripeAvailable(): boolean {
  return !MOCK_MODE && getStripe() !== null;
}

const METADATA_VALUE_MAX = 500;

/** Chunk a string for Stripe metadata (500 chars per value). */
function chunkForMetadata(json: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < json.length; i += METADATA_VALUE_MAX) {
    out[`form_data_${Math.floor(i / METADATA_VALUE_MAX)}`] = json.slice(i, i + METADATA_VALUE_MAX);
  }
  return out;
}

export interface CreateSessionInput {
  tier: TierId;
  addonIds: AddOnId[];
  customerEmail: string;
  /** Order form data from checkout page; stored in session metadata for webhook. */
  formData?: Record<string, unknown> | null;
  successUrl?: string;
  cancelUrl?: string;
}

export async function createCheckoutSession(input: CreateSessionInput): Promise<{ url: string; sessionId?: string }> {
  const baseUrl = getBaseUrl();

  // Mock/local: skip Stripe and return success URL. Production: create session and return Stripe Checkout URL.
  if (MOCK_MODE || !getStripe()) {
    const sessionId = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    return {
      url: `${baseUrl}/order/success?session_id=${sessionId}`,
      sessionId,
    };
  }

  const tier = TIERS.find((t) => t.id === input.tier);
  if (!tier) throw new Error("Invalid tier");

  function makeLineItem(
    priceId: string | undefined,
    amount: number,
    name: string,
    description: string,
    context: string
  ): Stripe.Checkout.SessionCreateParams.LineItem {
    const id = ensurePriceId(priceId, context);
    if (id) {
      return { price: id, quantity: 1 };
    }
    return {
      price_data: {
        currency: "usd",
        unit_amount: amount,
        product_data: { name, description },
      },
      quantity: 1,
    };
  }

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    makeLineItem(
      getStripePriceId(STRIPE_PRICE_KEYS[tier.stripePriceIdKey]),
      tier.price,
      tier.name,
      tier.description,
      `Chart tier "${tier.name}"`
    ),
  ];

  for (const addonId of input.addonIds) {
    const addon = ADDONS.find((a) => a.id === addonId);
    if (!addon) continue;
    lineItems.push(
      makeLineItem(
        getStripePriceId(STRIPE_PRICE_KEYS[addon.stripePriceIdKey]),
        addon.price,
        addon.name,
        addon.description,
        `Add-on "${addon.name}"`
      )
    );
  }

  const metadata: Record<string, string> = {
    tier: input.tier,
    addons: JSON.stringify(input.addonIds),
  };
  if (input.formData && Object.keys(input.formData).length > 0) {
    const json = JSON.stringify(input.formData);
    Object.assign(metadata, chunkForMetadata(json));
  }

  const session = await getStripe()!.checkout.sessions.create({
    mode: "payment",
    customer_email: input.customerEmail,
    line_items: lineItems,
    success_url: input.successUrl ?? `${baseUrl}/order/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: input.cancelUrl ?? `${baseUrl}/`,
    metadata,
  });

  return {
    url: session.url ?? `${baseUrl}/order/success?session_id=${session.id}`,
    sessionId: session.id,
  };
}

// --- Course checkout (Learn page) ---

export async function createCourseCheckoutSession(
  tierId: CourseTierId,
  customerEmail?: string | null
): Promise<{ url: string }> {
  const baseUrl = getBaseUrl();
  const successUrl = `${baseUrl}/workflow/access?tier=${tierId}`;
  const cancelUrl = `${baseUrl}/workflow`;

  if (MOCK_MODE || !getStripe()) {
    return { url: successUrl };
  }

  const sales = COURSE_TIER_SALES[tierId];
  const priceId = ensurePriceId(
    getStripePriceId(COURSE_STRIPE_PRICE_ENV_KEYS[tierId]),
    `Course tier "${sales.name}"`
  );

  const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = priceId
    ? { price: priceId, quantity: 1 }
    : {
        price_data: {
          currency: "usd",
          unit_amount: sales.priceCents,
          product_data: { name: sales.name, description: `Course: ${sales.name}` },
        },
        quantity: 1,
      };

  const session = await getStripe()!.checkout.sessions.create({
    mode: "payment",
    ...(customerEmail && { customer_email: customerEmail }),
    line_items: [lineItem],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { type: "course", tier: tierId },
  });

  return {
    url: session.url ?? successUrl,
  };
}
