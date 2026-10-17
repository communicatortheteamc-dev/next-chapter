# Next chapter — Commerce studio

An original fashion storefront, staff workspace, and customer CRM built with Next.js App Router, React, TypeScript, Tailwind CSS, NextAuth, and Prisma/PostgreSQL. Money is represented as integer paise throughout the server.

## Start locally

Requires Node.js 22 or newer and npm.

```sh
npm install
npx prisma generate
cp .env.example .env.local
# Set NEXTAUTH_SECRET to a random value and DEMO_ADMIN_PASSWORD to 12+ characters.
npm run dev
```

Open http://localhost:3000. Set your own local demo password in the ignored `.env.local` file and sign in as **admin@example.com**. The demo login is disabled in production. No real customer data or service credentials are included.

Without `DATABASE_URL`, the app starts with twelve illustrative products and saves local demo changes under `.data/demo.json`. Delete that generated file to reset your local demo. Demo mode is a **single Node process** adapter; it is unsuitable for multiple replicas or a serverless writable filesystem. PostgreSQL mode never reads this demo file. Demo orders do not collect money or arrange shipments.

## PostgreSQL

```sh
docker compose up -d
# In .env.local, set:
# DATABASE_URL=postgresql://commerce:local-only-change-me@localhost:5432/commerce
# OWNER_EMAIL=you@example.com
# OWNER_PASSWORD=<a unique password of at least 12 characters>
# NEXTAUTH_SECRET=<a random 32-byte or longer secret>
npm run db:migrate
npm run db:seed
npm run dev
```

The Prisma CLI and standalone seed script load `.env` by default; Next loads `.env.local`. Supply the same variables to both, either through your shell/secret manager or a local ignored `.env` file. Never commit credentials. The seed command is idempotent; it does not reset existing commerce data or overwrite an existing owner account. Customer accounts registered through the UI are stored separately with bcrypt password hashes. An owner can promote an existing account in Staff & permissions. Staff roles are re-read from the database for each authorisation check so demotions take effect immediately.

The seeded catalogue remains **illustrative**, including in a newly seeded PostgreSQL database. Replace products, photos, sizes, stock, tax assumptions, and draft policies with reviewed business data before accepting live orders.

## Page map and component system

- `/`: campaign, categories, arrivals, essentials edit, slow-days edit, story, newsletter.
- `/shop`: URL-based search, category/size/colour/price/fit/stock filters, price and date/best-seller sorting based on actual paid orders, active filters, mobile filter drawer, accessible load-more.
- `/products/[slug]`: responsive gallery, colour/size selection, stock validation, size guide, wishlist, quantity, bag, buy-now, indicative delivery check, restock requests, verified-purchase review submission, related/recently viewed pieces.
- `/cart`, `/checkout`, `/order/[id]`: bag editing, server quotes, validated coupons, guest addresses, sandbox/COD/Razorpay checkout, private confirmation, payment status and retry.
- `/account`, `/wishlist`: login/registration, orders, delivery tracking reference, saved addresses, marketing preference, local wishlist, return/exchange and support links.
- `/about`, `/contact`, `/faq`, `/shipping`, `/returns`, `/privacy`, `/terms`: story, CRM-connected enquiries and shared policy content.
- `/admin`: revenue/volume/AOV date ranges, open fulfilment, low-stock and follow-up reminders; catalogue, collections, inventory/ledger, orders, customers/segments/profiles, enquiry pipeline, support workflow, coupons, content, review moderation, rules, roles and audit history.

Warm canvas, forest accent, charcoal text, subtle rules, squared controls and a restrained serif contrast form the shared design system in `src/app/globals.css`. Shared primitives cover product cards, responsive images, modal/drawer focus handling, notices, forms and empty states. Lucide supplies consistent icons. Native modal dialogs contain keyboard focus, close on Escape, and restore prior focus.

## Data model and consistency

`prisma/schema.prisma` models authenticated `User` records with server-enforced roles, plus a versioned PostgreSQL JSONB `CommerceState` aggregate. The typed aggregate (`src/lib/types.ts`) contains products and variant stock/SKUs, orders and line-item snapshots, coupons, collections, customers, addresses/preferences, internal notes, support/enquiry records, reviews, settings, inventory adjustments, processed webhook IDs, newsletter consent, and audit history.

Every commerce mutation runs in a serializable PostgreSQL transaction with a compare-and-swap version check and bounded conflict retries. Quotes always use server catalogue prices, enforce merged variant quantities, validate coupons, and calculate shipping after discounts. Order creation reserves stock and consumes the coupon atomically. Duplicate checkout request IDs reuse the order. Browser retries preserve the request ID for the same checkout. Cancellation restores stock only once. Pending-payment orders retain reservations; staff must cancel abandoned, unpaid orders from Orders. Schedule an expiry worker before a high-volume launch.

The aggregate keeps cross-domain operations atomic in this initial codebase. It also serializes unrelated writes. For a high-volume store, split the aggregate into indexed relational product, variant, order, customer, and inventory tables while preserving transaction boundaries. Do not treat this aggregate as an unlimited-scale architecture.

## Permissions

| Role | Capabilities |
| --- | --- |
| Owner | All staff features, store rules/content, staff role changes |
| Manager | Catalogue, inventory, collections, promotions, order cancellation, fulfilment, CRM, review moderation, CSV export |
| Support | Staff read access, order fulfilment, customer notes/tags/assignment, support/enquiry updates |
| Customer | Own account, orders and support history, verified delivered purchase reviews |

Admin pages redirect unauthorised users; API handlers independently enforce roles. CSV export requires owner/manager permission and escapes cells to limit spreadsheet formula injection. Customer order details require a signed-in owning account or the unguessable private order confirmation token. Never share confirmation URLs publicly. Password sign-in includes a local process attempt limiter; a shared persistent rate limiter and edge request limits are required for multiple production replicas.

## Integrations and launch requirements

### Razorpay

Implemented server order creation and browser Checkout, provider-creation leases, payment failure/dismiss/retry handling, raw-body HMAC-SHA256 webhook verification, amount/currency matching, and transactional event deduplication. Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`. Register the public HTTPS webhook `/api/payments/webhook` for `payment.captured`. Use Razorpay test credentials in staging before enabling live credentials. A browser redirect never marks an order paid. Late captured payments for cancelled orders require manual review; this handler rejects them instead of silently fulfilling.

Refunds are intentionally performed in the Razorpay dashboard; automated refund execution and reconciliation are **not implemented**. The admin order screen explains this. Configure a reconciliation job for provider outages, delayed webhooks, disputed/cancelled payments, and partial refunds before live operations. Protect the webhook with body size limits at the proxy, while preserving the raw body.

### Object storage

The staff product form can request a short-lived S3-compatible presigned PUT URL and upload JPEG/PNG/WebP files. Configure all `S3_*` variables, a public HTTPS image URL, and bucket CORS for the application origin, PUT and Content-Type. The UI limits files to 10 MB. Use provider-side size/content verification and private-to-public moderation for untrusted uploaders before broadening access beyond trusted staff. `next.config.ts` restricts optimized images to Unsplash and the configured S3 host; restart/rebuild after changing the host. The seeded photo URLs use Unsplash; no reference-site imagery was copied.

### Shipping and notifications

Delivery estimates are explicitly indicative. Postcode format checks and configured COD postcode eligibility work; carrier API serviceability, shipment creation, tracking sync, email, SMS, WhatsApp, and marketing campaigns **are not connected**. Forms persist requests/consent and explain that no notification has been sent. Staff can enter carrier and tracking references manually. Transactional messages and marketing preferences are kept separate. Connect your approved providers and their consent/unsubscribe workflows before launch.

### Business content and tax

Change `NEXT_PUBLIC_BRAND_NAME`, `NEXT_PUBLIC_SITE_URL`, and rebuild. Owner-managed content includes the campaign headline/description, announcement, FAQs, and draft policies. Use `{freeShipping}` and `{returnDays}` in announcement text so shared rules remain consistent when edited. Shipping thresholds/fees, return window, and COD rules are shared across the store. Prices are tax-inclusive, with editable per-product tax rates and proportional coupon allocation. Seed products use an **illustrative 5% rate**. Confirm product-specific GST, shipping tax treatment, and invoice handling with the merchant before taking live payments. Policy text and garment measurements are drafts. Campaign slides are configured in `src/components/hero-carousel.tsx`; the first slide’s headline/description remains editable in Content. Other media is configured in `src/lib/catalog.ts`; arbitrary homepage section ordering, shipping-label generation, store credit, shoppable video, password reset/email verification, and automated return/refund processing are extension work.

Best-seller rankings are not fabricated. No fictional revenue, customer reviews or sales figures are seeded. New-arrivals and editorial collections give the demo useful browsing without invented claims.

## Verification

```sh
npm run typecheck
npm test
npm run build
```

Unit coverage includes canonical totals, post-discount shipping, duplicate lines/stock, coupon expiry/eligibility/usage, checkout idempotency, overselling, COD serviceability, signed webhooks, payment amount matching, duplicate events, and address/quantity validation.

`tests/browser-check.mjs` exercises the running local app with Playwright: responsive storefront overflow at 360/390/768/1024/1440, URL sorting, size validation, bag, guest sandbox checkout, staff login, and all admin routes. Install the package-matched Chromium with `npx playwright install chromium`, or point `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to an existing Chromium executable. Browser QA writes **test records into demo storage**; use an isolated demo and reset it after testing. `tests/workflows-check.mjs` checks product persistence, stock adjustment validation, CRM transitions, cross-origin rejection, and responsive pages. `tests/access-check.mjs` verifies server permissions for all four roles using short-lived locally signed test sessions. Run those only against the isolated development demo. Screenshots are in `artifacts/`.

PostgreSQL concurrency, live payment/webhook delivery, real S3 uploads and provider notification/shipping behaviour require configured infrastructure and have not been exercised in this environment.

## Deploy a Node application

Deploy to a Node-compatible Next.js host with writable build storage, a managed PostgreSQL database, and configured environment secrets. Do not use a static export: accounts, administration and checkout require a server.

```sh
npm ci
npm run db:migrate
npm run db:seed
npm run build
npm start
```

Set production `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` to your HTTPS domain and a unique `NEXTAUTH_SECRET`. Configure your proxy/host for HTTPS, request body limits and rate limiting. `npm run build` does not require a database connection; runtime pages and sitemap do. Production refuses file-backed demo storage unless explicitly launched with `ALLOW_DEMO=true` for a disposable single-process preview. The demo admin password never works in production. Use database accounts for staff.

Integration references reviewed during implementation: [Next.js App Router](https://nextjs.org/docs/app/getting-started/installation), [Prisma ORM](https://www.prisma.io/docs/orm), [NextAuth credentials](https://next-auth.js.org/configuration/providers/credentials), [Razorpay order integration](https://razorpay.com/docs/payments/server-integration/nodejs/integration-steps/), [Razorpay webhook validation](https://razorpay.com/docs/webhooks/validate-test/). [MyDesignation](https://www.mydesignation.com/) was reviewed for shopping scope and category organisation only.

## Current visual identity and concept catalogue

The updated Next chapter direction uses a monochrome uppercase wordmark, warm off-white backgrounds, restrained typography and a cohesive studio-photographed menswear edit. Identity files live in `public/brand/`; the current primary artwork is `next-chapter-wordmark.svg`. All lettering is outlined and requires no web font.

The 12 product photographs and editorial still-life in `public/images/premium/` were created with the built-in image-generation tool. These are illustrative concept garments and example materials/prices, not verified photographs or specifications of physical stock. Full prompts are in that folder's README. Replace them with merchant-owned imagery and confirmed product information before live sales.

Existing original local demo products receive the new merchandising on read. This upgrade retains product/variant IDs, stock, custom prices, customers and historical order snapshots; it does not overwrite merchant-uploaded photography or an existing PostgreSQL catalogue. Newly seeded databases use the updated concept catalogue. Autoplay remains enabled on the homepage and its removed control bar stays absent.

## Deploy this repository to Vercel

Import this GitHub repository as a Next.js project, using the repository root and `npm run build`. Do not use static export or local JSON demo storage on Vercel.

Before deploying, provision PostgreSQL and configure these environment variables in Vercel:

- `DATABASE_URL`: your PostgreSQL connection string, with provider-required TLS and connection settings.
- `NEXTAUTH_SECRET`: a unique random secret (generate with `openssl rand -base64 32`).
- `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL`: the final HTTPS deployment domain.
- `NEXT_PUBLIC_BRAND_NAME`: `Next chapter`.
- `ALLOW_DEMO`: `false`.

Initialize that database from a trusted terminal with the same `DATABASE_URL`, plus a private `OWNER_EMAIL` and `OWNER_PASSWORD` (at least 12 characters):

```sh
npm ci
npm run db:generate
npm run db:migrate
npm run db:seed
```

Keep the owner password out of Git and shell history; supply it through your environment or secret manager. Migrations and seed are explicit deployment preparation steps, not part of the build. Redeploy after setting environment variables. Configure optional Razorpay and S3 variables from `.env.example` when enabling those integrations.
