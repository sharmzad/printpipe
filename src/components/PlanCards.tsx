import Link from "next/link";
import { startCheckout } from "@/lib/actions";
import { plans } from "@/lib/plans";

export default function PlanCards() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {Object.values(plans).map((plan) => {
        const featured = plan.id === "pro";
        return (
          <div key={plan.id} className={`flex flex-col rounded-3xl border p-7 ${featured ? "border-ink bg-ink text-white shadow-xl" : "border-line bg-card"}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl">{plan.name}</h3>
              {featured && <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold">Most popular</span>}
            </div>
            <p className={`mt-1 text-sm ${featured ? "text-white/70" : "text-muted"}`}>{plan.blurb}</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="font-display text-5xl">${plan.price}</span>
              <span className={featured ? "text-white/70" : "text-muted"}>/month</span>
            </div>
            <ul className="mt-6 flex-1 space-y-2 text-sm">
              {plan.features.map((f) => (
                <li key={f} className="flex gap-2"><span className="text-accent">✓</span>{f}</li>
              ))}
            </ul>
            {plan.id === "free" ? (
              <Link href="/signup" className="btn-ghost mt-8 text-ink">Start free</Link>
            ) : (
              <form action={startCheckout} className="mt-8">
                <input type="hidden" name="plan" value={plan.id} />
                <button className={`${featured ? "btn-primary" : "btn-ink"} w-full`}>Get {plan.name}</button>
              </form>
            )}
          </div>
        );
      })}
    </div>
  );
}
