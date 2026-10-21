"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSession, currentUser, destroySession, newApiKey } from "./auth";
import { db } from "./db";
import { planFor, priceIdFor, type PlanId } from "./plans";
import { site } from "./site";
import { stripe } from "./stripe";

export type FormState = { error?: string; key?: string } | undefined;

function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export async function signup(_: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email address." };
  if (password.length < 8) return { error: "Use at least 8 characters for your password." };
  if (await db.user.findUnique({ where: { email } })) return { error: "An account with this email already exists. Log in instead." };
  const user = await db.user.create({ data: { email, passwordHash: await bcrypt.hash(password, 12) } });
  await createSession(user.id);
  const next = safeNext(form.get("next"));
  redirect(`${next}${next.includes("?") ? "&" : "?"}welcome=1`);
}

export async function login(_: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return { error: "Wrong email or password." };
  await createSession(user.id);
  redirect(safeNext(form.get("next")));
}

export async function logout() {
  await destroySession();
  redirect("/");
}

export async function createApiKey(_: FormState, form: FormData): Promise<FormState> {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (!planFor(user.plan).api) return { error: "API access is included in the Pro and Business plans." };
  if ((await db.apiKey.count({ where: { userId: user.id } })) >= 10) return { error: "You can have up to 10 keys. Delete one first." };
  const name = String(form.get("name") ?? "").trim().slice(0, 60) || "My key";
  const { key, prefix, hash } = newApiKey();
  await db.apiKey.create({ data: { userId: user.id, name, prefix, hash } });
  revalidatePath("/dashboard");
  return { key };
}

export async function deleteApiKey(form: FormData) {
  const user = await currentUser();
  if (!user) redirect("/login");
  await db.apiKey.deleteMany({ where: { id: String(form.get("id")), userId: user.id } });
  revalidatePath("/dashboard");
}

export async function startCheckout(form: FormData) {
  const plan = String(form.get("plan")) as PlanId;
  const user = await currentUser();
  if (!user) redirect(`/signup?next=${encodeURIComponent("/pricing")}`);
  const price = priceIdFor(plan);
  if (!price) throw new Error(`No Stripe price configured for plan ${plan}`);

  // Already subscribed: plan changes happen in the Stripe customer portal.
  if (user.stripeSubscriptionId && user.plan !== "free") return openBillingPortal();

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe().customers.create({ email: user.email, metadata: { userId: user.id } });
    customerId = customer.id;
    await db.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
  }
  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: user.id,
    line_items: [{ price, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${site.url}/dashboard?checkout=success&plan=${plan}`,
    cancel_url: `${site.url}/pricing`,
  });
  redirect(session.url!);
}

export async function openBillingPortal() {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (!user.stripeCustomerId) redirect("/pricing");
  const session = await stripe().billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${site.url}/dashboard`,
  });
  redirect(session.url);
}
