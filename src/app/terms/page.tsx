import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Terms of Service", alternates: { canonical: "/terms" } };

// Template text: have it reviewed for your country and business before launch.
export default function Terms() {
  return (
    <div className="prose-simple mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-display text-5xl">Terms of Service</h1>
      <p>Last updated: October 21, 2026</p>
      <h2>The service</h2>
      <p>{site.name} provides online tools and an API to create, convert and edit PDF and image files. We may change or improve features at any time.</p>
      <h2>Acceptable use</h2>
      <ul>
        <li>Only upload files you have the right to process.</li>
        <li>Don't use the service for illegal content, malware, spam or to attack other systems.</li>
        <li>Don't try to bypass plan limits, for example with multiple free accounts.</li>
      </ul>
      <h2>Subscriptions</h2>
      <p>Paid plans renew monthly until cancelled. You can cancel anytime from your dashboard; your plan stays active until the end of the paid period. Unused conversions don't roll over.</p>
      <h2>Liability</h2>
      <p>The service is provided “as is”. Keep your own copies of important files. Our total liability is limited to the amount you paid us in the last 12 months.</p>
      <h2>Contact</h2>
      <p>Questions? Email <a href={`mailto:${site.supportEmail}`} className="underline">{site.supportEmail}</a>.</p>
    </div>
  );
}
