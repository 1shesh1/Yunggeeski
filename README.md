# Data-Driven Financial Charts

Productized service website for fixed-price, scope-defined financial chart creation. Built with Next.js App Router, TypeScript, Tailwind, shadcn/ui, React Hook Form, and Zod.

## Features

- **3 packages**: Basic ($50), Standard ($150), Premium ($300) with optional add-ons
- **Stripe Checkout** (scaffolded; supports mock mode without real keys)
- **Webhook-driven order creation** (Stripe → Supabase; mock mode no-op)
- **Mandatory post-payment order form** with strict validation (Zod)
- **Supabase** DB + Storage (scaffolded; mock mode uses in-memory store)
- **Resend** transactional emails (scaffolded; mock mode logs to console)
- **Netlify** deployment with `@netlify/plugin-nextjs`

## Local development (no real keys)

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Sample videos (`public/videos/*.mp4`) — Git LFS**

   Those files are stored with [Git LFS](https://git-lfs.com/) (see `.gitattributes`). If they are only ~130 bytes on disk, you have **pointer files**, not real videos — the site will not be able to play them.

   - Install Git LFS once: `git lfs install`
   - Fetch the real binaries: `git lfs pull` (from the repo root)

   Netlify: `GIT_LFS_ENABLED=true` is set in `netlify.toml` so production builds pull LFS objects.

3. **Environment**
   - Copy `.env.example` to `.env.local` (or use the provided `.env.local` with mock mode).
   - For local run without any real keys, ensure:
     ```env
     MOCK_MODE=true
     NEXT_PUBLIC_BASE_URL=http://localhost:3000
     ```
   - Leave all Stripe, Supabase, and Resend keys empty.

4. **Run the dev server**
   ```bash
   npm run dev
   ```

5. **Test the flow**
   - Open http://localhost:3000
   - Click **Buy** on any tier, add optional add-ons, enter an email, then **Proceed to payment**
   - You’ll be redirected to `/order/success?session_id=mock_xxx`
   - The success page will poll and receive a mock order, then show the mandatory order form
   - Submit the form; in mock mode the order updates in memory and “emails” are logged to the terminal

## Production setup

### Environment variables

Set these in your Netlify (or host) dashboard. **Never commit real secrets.**

| Variable | Description |
|----------|-------------|
| `MOCK_MODE` | Set to `false` (or omit) when using real Stripe/Supabase/Resend |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (for `/api/stripe/webhook`) |
| `STRIPE_PRICE_BASIC` | Stripe Price ID for Basic tier |
| `STRIPE_PRICE_STANDARD` | Stripe Price ID for Standard tier |
| `STRIPE_PRICE_PREMIUM` | Stripe Price ID for Premium tier |
| `STRIPE_ADDON_RUSH`, `STRIPE_ADDON_REVISION`, etc. | Add-on price IDs (see `.env.example`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `SUPABASE_STORAGE_BUCKET` | Storage bucket for order assets (default: `order-assets`) |
| `RESEND_API_KEY` | Resend API key |
| `EMAIL_FROM` | From address for transactional emails |
| `ADMIN_EMAIL` | Admin address for order summary emails |
| `NEXT_PUBLIC_SITE_URL` or `NEXT_PUBLIC_BASE_URL` | Full site URL (e.g. `https://yunggeeski.com`) |

### Stripe

- Create products and prices in Stripe for each tier and add-on.
- Add the price IDs to env (see `.env.example` for all `STRIPE_PRICE_*` and `STRIPE_ADDON_*` keys).
- Configure the webhook endpoint: `https://your-domain.com/api/stripe/webhook` for `checkout.session.completed`.

### Supabase

- Create a project and run `supabase/schema.sql` in the SQL editor.
- Create a storage bucket named `order-assets` (path: `{orderId}/logo.{ext}`).
- Add the URL and keys to env.

### Resend

- Get an API key and verify your domain in Resend.
- Set `EMAIL_FROM` and `ADMIN_EMAIL` in env.

## Deploy to Netlify

1. **Connect the repo** to Netlify (GitHub/GitLab/Bitbucket).

2. **Build settings** (usually auto-detected by the Next.js plugin):
   - Build command: `npm run build`
   - Publish directory: `.next` (handled by `@netlify/plugin-nextjs`)
   - Ensure `@netlify/plugin-nextjs` is in `package.json` and that `netlify.toml` includes:
     ```toml
     [[plugins]]
       package = "@netlify/plugin-nextjs"
     ```

3. **Environment variables**  
   Add all production env vars in Netlify: Site settings → Environment variables.

4. **Deploy**  
   Trigger a deploy; the plugin will build and serve the Next.js app.

## Deploy troubleshooting: "unable to read file 1.pack.gz" / "3.pack.gz"

This usually means a bad Git or npm cache on Netlify. Try in order:

1. **Clear cache and redeploy** — In Netlify: **Site → Deploys → "Trigger deploy"** → choose **"Clear cache and deploy site"**. Do not use "Deploy site" (which keeps cache).
2. **Confirm lock file** — The build uses `npm ci`, which requires a `package-lock.json`. If you use Yarn, switch the build command to `yarn install --frozen-lockfile && yarn build` and ensure `yarn.lock` is committed.
3. **No Git LFS** — If you don’t use Git LFS, make sure no LFS files are in the repo. If you do use LFS, install the [Netlify Git LFS plugin](https://github.com/netlify/netlify-lfs-plugin) so LFS files are fetched during build.
4. **Nothing from .git in the repo** — Ensure `.next` and `node_modules` are not committed (they’re in `.gitignore`). If they were added before, run `git rm -r --cached .next node_modules` and commit.

**Secrets scanning:** If the build fails with "Secrets scanning detected secrets in files", the repo uses `SECRETS_SCAN_OMIT_PATHS` in `netlify.toml` to skip false positives (README, `lib/env.ts`, schema comments). Real secrets must only be in Netlify env vars.

## Before deploying (checklist)

- Run `npm install`, then `npm test` (runs lint, `tsc --noEmit`, and production build) — all should pass.
- Ensure `.env.example` is committed; do not commit `.env` or `.env.local` with real secrets.
- For production, set `MOCK_MODE=false` and add all required env vars in Netlify.

## Project structure

- `app/` — App Router pages and API routes
- `app/api/checkout/create-session` — Create Stripe (or mock) checkout session
- `app/api/stripe/webhook` — Stripe webhook (order creation in real mode)
- `app/api/orders/by-session` — Get order by `session_id`
- `app/api/orders/submit` — Submit post-payment order form
- `components/` — PricingCards, AddOnSelector, OrderForm, StatusCard, ui
- `lib/` — pricing config, Zod schemas, stripe, supabase, resend, mockStore, env

## TODO markers

- **Stripe**: Set real Price IDs in env and optionally use them in `lib/stripe.ts` (see `STRIPE_PRICE_KEYS` in `lib/pricing.ts`).
- **Supabase**: Run `supabase/schema.sql`, create `order-assets` bucket, set env.
- **Resend**: Set API key and from/admin emails in env.
