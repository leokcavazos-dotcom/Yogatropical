import Stripe from "stripe";

export function isPaymentsConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe isn't configured (STRIPE_SECRET_KEY is unset).");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
}
