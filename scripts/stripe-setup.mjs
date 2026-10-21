// Creates the Pro and Business products and monthly prices in your Stripe account.
// Run once per Stripe mode (test, then live):  STRIPE_SECRET_KEY=sk_... npm run stripe:setup
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("Set STRIPE_SECRET_KEY first.");
  process.exit(1);
}
const stripe = new Stripe(key);

const wanted = [
  { lookup: "printpipe_pro_monthly", name: "PrintPipe Pro", amount: 900, env: "STRIPE_PRICE_PRO" },
  { lookup: "printpipe_business_monthly", name: "PrintPipe Business", amount: 2900, env: "STRIPE_PRICE_BUSINESS" },
];

for (const p of wanted) {
  const existing = await stripe.prices.list({ lookup_keys: [p.lookup], limit: 1 });
  let price = existing.data[0];
  if (!price) {
    const product = await stripe.products.create({ name: p.name });
    price = await stripe.prices.create({
      product: product.id,
      unit_amount: p.amount,
      currency: "usd",
      recurring: { interval: "month" },
      lookup_key: p.lookup,
    });
  }
  console.log(`${p.env}=${price.id}`);
}
