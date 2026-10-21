# PrintPipe

Online PDF tools and a PDF API with subscriptions, built on [Gotenberg](https://github.com/gotenberg/gotenberg).

- Next.js 15 (App Router) + Tailwind, Postgres via Prisma, Stripe subscriptions
- 23 tools defined in `src/lib/tools.ts`. Each one gets an SEO landing page (`/tools/<slug>`), a web form, an API endpoint (`/api/v1/<slug>`) and a sitemap entry.
- Plans and limits live in `src/lib/plans.ts` (Free 20/mo, Pro $9 1,000/mo, Business $29 10,000/mo, visitors without an account 3/day)

## Deploy on Railway

1. Push this folder to a GitHub repo, then in the Railway project that already runs Gotenberg: **New → GitHub Repo**.
2. **New → Database → PostgreSQL**. In the web service's Variables, add `DATABASE_URL=${{Postgres.DATABASE_URL}}`.
3. Add the other variables from `.env.example`. Use `GOTENBERG_URL=http://gotenberg.railway.internal:3000` so traffic stays on Railway's private network.
4. Generate a domain for the web service and set `NEXT_PUBLIC_SITE_URL` to it (later, your own domain).
5. Stripe:
   - Run `STRIPE_SECRET_KEY=sk_test_... npm run stripe:setup` and copy the two price IDs into the Railway variables.
   - In Stripe → Developers → Webhooks, add the endpoint `https://<your-domain>/api/stripe/webhook` with the events `checkout.session.completed` and `customer.subscription.created/updated/deleted`. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
   - Turn on the Customer Portal (Settings → Billing → Customer portal) and allow plan switching and cancelling.
6. Database migrations run automatically on start (`prisma migrate deploy`).

## Lock down Gotenberg

When the site is live, remove Gotenberg's public domain (Settings → Networking) so only the site can reach it through the private network. Alternatively set `API_ENABLE_BASIC_AUTH=true`, `GOTENBERG_API_BASIC_AUTH_USERNAME` and `GOTENBERG_API_BASIC_AUTH_PASSWORD` on the Gotenberg service, and the same username and password as `GOTENBERG_USERNAME` / `GOTENBERG_PASSWORD` on the web service.

## Google Ads and Analytics

Set `NEXT_PUBLIC_GA_ID` (G-…) and `NEXT_PUBLIC_GOOGLE_ADS_ID` (AW-…). In Google Ads, create two conversion actions (Sign-up, Purchase) and put their labels in `NEXT_PUBLIC_ADS_SIGNUP_LABEL` and `NEXT_PUBLIC_ADS_PURCHASE_LABEL`. A consent banner appears automatically when tracking is on; tracking starts denied (Consent Mode v2).

Good ad landing pages are the tool pages, e.g. `/tools/word-to-pdf` for "word to pdf converter" keywords. Visitors can use a tool right away without signing up.

## Local development

```bash
cp .env.example .env   # fill in DATABASE_URL etc.
npm install
npx prisma migrate dev
npm run dev
```
