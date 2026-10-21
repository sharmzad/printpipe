import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy Policy", alternates: { canonical: "/privacy" } };

// Template text: have it reviewed for your country and business before launch.
export default function Privacy() {
  return (
    <div className="prose-simple mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-display text-5xl">Privacy Policy</h1>
      <p>Last updated: October 21, 2026</p>
      <h2>Files you upload</h2>
      <p>Files are sent over an encrypted (HTTPS) connection, processed in memory to produce your result, and deleted immediately afterwards. We do not store, read or share the content of your files.</p>
      <h2>Account data</h2>
      <p>If you create an account we store your email address, a hashed password, your plan, and a log of which tools you used and when (not the files). We use this to run your account and enforce plan limits.</p>
      <h2>Payments</h2>
      <p>Payments are processed by Stripe. We never see or store your full card number. Stripe's privacy policy applies to the payment data it handles.</p>
      <h2>Cookies and analytics</h2>
      <p>We use a strictly necessary cookie to keep you logged in. With your consent, we use Google Analytics and Google Ads cookies to understand traffic and measure our advertising. You can decline these in the cookie banner.</p>
      <h2>Your rights</h2>
      <p>You can ask us to export or delete your account data at any time by emailing <a href={`mailto:${site.supportEmail}`} className="underline">{site.supportEmail}</a>.</p>
    </div>
  );
}
