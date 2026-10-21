import type { Metadata } from "next";
import PlanCards from "@/components/PlanCards";
import { anonymous } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Pricing – PDF Tools & PDF API Plans",
  description: "Free, Pro ($9/month) and Business ($29/month) plans for our online PDF tools and PDF API. Cancel anytime.",
  alternates: { canonical: "/pricing" },
};

const faq = [
  { q: "Can I cancel anytime?", a: "Yes. Cancel from your dashboard in one click. You keep your plan until the end of the billing period." },
  { q: "What counts as a conversion?", a: "Every successful run of a tool (one request) counts as one conversion, even if it contains several files." },
  { q: "What happens if I run out?", a: "Tools pause until your monthly allowance resets on the 1st, or you can upgrade instantly." },
  { q: "Can I try before signing up?", a: `Yes. Every tool works ${anonymous.dailyConversions} times a day without an account.` },
  { q: "Which payment methods do you accept?", a: "All major cards, plus Apple Pay and Google Pay, processed securely by Stripe." },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-center font-display text-5xl">Pricing</h1>
      <p className="mx-auto mt-4 mb-12 max-w-xl text-center text-lg text-muted">Start free. Upgrade when you need more conversions, bigger files or the API.</p>
      <PlanCards />
      <div className="mx-auto mt-20 max-w-3xl">
        <h2 className="mb-5 font-display text-3xl">Billing questions</h2>
        <div className="divide-y divide-line rounded-2xl border border-line bg-card">
          {faq.map((f) => (
            <details key={f.q} className="p-5">
              <summary className="cursor-pointer font-semibold">{f.q}</summary>
              <p className="mt-2 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
