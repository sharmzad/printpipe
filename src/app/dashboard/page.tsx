import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import ApiKeyCreate from "@/components/ApiKeyCreate";
import { deleteApiKey, logout, openBillingPortal } from "@/lib/actions";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { planFor } from "@/lib/plans";
import { getTool } from "@/lib/tools";
import { monthlyUsage } from "@/lib/usage";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ checkout?: string }> }) {
  const user = await currentUser();
  if (!user) redirect("/login?next=/dashboard");
  const { checkout } = await searchParams;
  const plan = planFor(user.plan);
  const [used, keys, recent] = await Promise.all([
    monthlyUsage(user.id),
    db.apiKey.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    db.usage.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 10 }),
  ]);
  const pct = Math.min(100, Math.round((used / plan.monthlyConversions) * 100));

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">Dashboard</h1>
          <p className="mt-1 text-muted">{user.email}</p>
        </div>
        <form action={logout}><button className="btn-ghost">Log out</button></form>
      </div>

      {checkout === "success" && (
        <div className="mt-6 rounded-2xl bg-ink p-5 text-white">
          Thanks for subscribing! {plan.id === "free" ? "Your plan will update in a few seconds; refresh the page." : `You're on ${plan.name} now.`}
        </div>
      )}

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <section className="rounded-3xl border border-line bg-card p-6">
          <h2 className="text-sm font-semibold text-muted">Plan</h2>
          <div className="mt-2 font-display text-3xl">{plan.name}</div>
          <p className="mt-1 text-sm text-muted">{plan.monthlyConversions.toLocaleString()} conversions/month · files up to {plan.maxFileMb} MB{plan.api ? " · API access" : ""}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {plan.id !== "business" && <Link href="/pricing" className="btn-primary">Upgrade</Link>}
            {user.stripeCustomerId && (
              <form action={openBillingPortal}><button className="btn-ghost">Manage billing</button></form>
            )}
          </div>
          {user.subscriptionStatus === "past_due" && <p className="mt-4 text-sm text-accent-dark">Your last payment failed. Update your card in Manage billing.</p>}
        </section>

        <section className="rounded-3xl border border-line bg-card p-6">
          <h2 className="text-sm font-semibold text-muted">This month</h2>
          <div className="mt-2 font-display text-3xl">{used.toLocaleString()} <span className="text-lg text-muted">/ {plan.monthlyConversions.toLocaleString()}</span></div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-paper">
            <div className={`h-full rounded-full ${pct >= 90 ? "bg-accent" : "bg-ink"}`} style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-sm text-muted">Resets on the 1st of each month (UTC).</p>
        </section>
      </div>

      <section className="mt-5 rounded-3xl border border-line bg-card p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl font-semibold">API keys</h2>
          <Link href="/api-docs" className="text-sm underline">API docs</Link>
        </div>
        {plan.api ? (
          <div className="mt-4 space-y-4">
            <ApiKeyCreate />
            {keys.length > 0 && (
              <ul className="divide-y divide-line rounded-xl border border-line">
                {keys.map((k) => (
                  <li key={k.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                    <span><strong>{k.name}</strong> <code className="ml-2 text-muted">{k.prefix}…</code></span>
                    <span className="flex items-center gap-4 text-muted">
                      {k.lastUsedAt ? `Used ${k.lastUsedAt.toISOString().slice(0, 10)}` : "Never used"}
                      <form action={deleteApiKey}>
                        <input type="hidden" name="id" value={k.id} />
                        <button className="text-accent-dark hover:underline">Delete</button>
                      </form>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">API access is included in Pro and Business. <Link href="/pricing" className="underline">Upgrade</Link> to create keys.</p>
        )}
      </section>

      <section className="mt-5 rounded-3xl border border-line bg-card p-6">
        <h2 className="text-xl font-semibold">Recent activity</h2>
        {recent.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Nothing yet. <Link href="/tools" className="underline">Try a tool</Link>.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line text-sm">
            {recent.map((u) => (
              <li key={u.id} className="flex justify-between py-2">
                <span>{getTool(u.tool)?.name ?? u.tool} <span className="text-muted">· {u.source}</span></span>
                <span className="text-muted">{u.createdAt.toISOString().replace("T", " ").slice(0, 16)} UTC</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
