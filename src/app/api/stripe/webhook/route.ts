import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { planForPriceId } from "@/lib/plans";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

async function syncSubscription(sub: Stripe.Subscription) {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const active = sub.status === "active" || sub.status === "trialing" || sub.status === "past_due";
  const plan = active ? planForPriceId(sub.items.data[0]?.price.id) : "free";
  await db.user.updateMany({
    where: { stripeCustomerId: customerId },
    data: { plan, stripeSubscriptionId: active ? sub.id : null, subscriptionStatus: sub.status },
  });
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) return NextResponse.json({ error: "Not configured" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(await req.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.mode === "subscription" && session.subscription) {
        const subId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
        await syncSubscription(await stripe().subscriptions.retrieve(subId));
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await syncSubscription(event.data.object);
      break;
  }
  return NextResponse.json({ received: true });
}
