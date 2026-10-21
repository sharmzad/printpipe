# PrintPipe launch checklist

Live site (test payments): https://printpipe-production.up.railway.app

## Done overnight
- [x] Password reset: "Forgot password?" on the login page, `/forgot-password`, `/reset-password`. Emails go out once Resend is set up (step 4). Until then the form tells people to contact support.
- [x] Favicon and a social share image (shown when the site is shared on WhatsApp, X, LinkedIn and in ad previews).
- [x] Gotenberg locked down: its public address is removed. Only the website can reach it, over Railway's private network. Conversions were re-tested afterwards.
- [x] Stripe **test** Customer Portal: cancel at the end of the period, switch between Pro and Business with proration. "Manage billing" works now.

## Your steps (I can't do these)

### 1. Switch the site to live Stripe (5 minutes)
Already done in your **live** Stripe account: the products PrintPipe Pro ($9/mo) and PrintPipe Business ($29/mo), the webhook `printpipe-subscriptions-live` (same URL, 4 events), and the Customer Portal (cancel and switch plans, both products).

In Railway → printpipe → Variables, change **all four** and then click **Deploy**:
- `STRIPE_PRICE_PRO` → `price_1USyyvP94Xeed99eeVIMJs3J`
- `STRIPE_PRICE_BUSINESS` → `price_1USyzyP94Xeed99eyhkl69kp`
- `STRIPE_SECRET_KEY` → your `sk_live_...` key (Stripe, live mode → Developers → API keys)
- `STRIPE_WEBHOOK_SECRET` → the `whsec_...` of the **live** webhook `printpipe-subscriptions-live` (Developers → Webhooks → it → Signing secret)

Mixing test and live values breaks checkout, so change all four together. After you switch, the test accounts on the site are still Pro in the database, but they have no live subscription.

### 2. Railway Hobby plan ($5/month)
Railway → Account → Plans. The trial credit runs out after 30 days or $5, and then the site and Gotenberg stop.

### 3. Domain
Buy it on Hostinger and tell me the name. I'll connect it in Railway, add the DNS records in Hostinger, then update `NEXT_PUBLIC_SITE_URL` and the Stripe webhook URLs.

### 4. Email for password resets (free)
After the domain: create a free account at resend.com and verify the domain (they give you DNS records; I can add them in Hostinger). Then add in Railway:
- `RESEND_API_KEY` → your `re_...` key
- `EMAIL_FROM` → e.g. `PrintPipe <no-reply@yourdomain.com>`

### 5. Small things
- `NEXT_PUBLIC_SUPPORT_EMAIL` in Railway: the address customers see on the site (right now it shows support@example.com).
- Final brand name: "PrintPipe" is a placeholder. One setting in `src/lib/site.ts`, plus the Stripe product names.
- Have someone check the Privacy and Terms pages for your country.

### 6. Traffic (after 1–5)
- Google Search Console: add the domain and submit `/sitemap.xml`.
- GA4 + Google Ads: create a property and two conversion actions (Sign-up, Purchase), then put the IDs in Railway (`NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_GOOGLE_ADS_ID`, `NEXT_PUBLIC_ADS_SIGNUP_LABEL`, `NEXT_PUBLIC_ADS_PURCHASE_LABEL`). Then I can plan the campaigns.
