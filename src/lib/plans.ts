export type PlanId = "free" | "pro" | "business";

export type Plan = {
  id: PlanId;
  name: string;
  price: number;
  monthlyConversions: number;
  maxFileMb: number;
  api: boolean;
  blurb: string;
  features: string[];
};

export const plans: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    monthlyConversions: 20,
    maxFileMb: 10,
    api: false,
    blurb: "For the occasional file.",
    features: ["20 conversions a month", "Files up to 10 MB", "All 23 tools"],
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 9,
    monthlyConversions: 1000,
    maxFileMb: 50,
    api: true,
    blurb: "For freelancers and daily use.",
    features: ["1,000 conversions a month", "Files up to 50 MB", "All 23 tools", "API access", "Email support"],
  },
  business: {
    id: "business",
    name: "Business",
    price: 29,
    monthlyConversions: 10000,
    maxFileMb: 100,
    api: true,
    blurb: "For teams and apps in production.",
    features: ["10,000 conversions a month", "Files up to 100 MB", "All 23 tools", "API access", "Priority support"],
  },
};

// Visitors who are not signed in can try any tool a few times a day.
export const anonymous = { dailyConversions: 3, maxFileMb: 5 };

export function planFor(id: string | null | undefined): Plan {
  return plans[(id as PlanId) in plans ? (id as PlanId) : "free"];
}

export function priceIdFor(plan: PlanId) {
  if (plan === "pro") return process.env.STRIPE_PRICE_PRO;
  if (plan === "business") return process.env.STRIPE_PRICE_BUSINESS;
  return undefined;
}

export function planForPriceId(priceId: string | undefined): PlanId {
  if (priceId && priceId === process.env.STRIPE_PRICE_PRO) return "pro";
  if (priceId && priceId === process.env.STRIPE_PRICE_BUSINESS) return "business";
  return "free";
}
