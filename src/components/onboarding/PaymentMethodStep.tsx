"use client";

import { useEffect, useState } from "react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
let stripePromise: Promise<Stripe | null> | null = null;
if (publishableKey) {
  stripePromise = loadStripe(publishableKey);
}

function CardSetupForm({ clientSecret, onDone }: { clientSecret: string; onDone: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);
    const card = elements.getElement(CardElement);
    if (!card) return;
    const result = await stripe.confirmCardSetup(clientSecret, {
      payment_method: { card },
    });
    setSubmitting(false);
    if (result.error) {
      setError(result.error.message ?? "Couldn't save that card.");
      return;
    }
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="rounded-lg border border-stone-300 px-3 py-3">
        <CardElement />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || submitting}
        className="w-full rounded-full bg-clay px-4 py-2 text-sm font-semibold text-white hover:bg-clay-dark disabled:opacity-60"
      >
        {submitting ? "Saving…" : "Save payment method"}
      </button>
    </form>
  );
}

interface PaymentMethodStepProps {
  role: "CLIENT" | "INSTRUCTOR" | "ADMIN";
  payoutEmail: string;
  onPayoutEmailChange: (value: string) => void;
  onSavePayoutEmail: () => void;
  onSkip: () => void;
}

export default function PaymentMethodStep({
  role,
  payoutEmail,
  onPayoutEmailChange,
  onSavePayoutEmail,
  onSkip,
}: PaymentMethodStepProps) {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/payments/status")
      .then((r) => r.json())
      .then((body: { configured: boolean }) => setConfigured(body.configured));
  }, []);

  useEffect(() => {
    if (configured && role === "CLIENT" && stripePromise) {
      fetch("/api/payments/setup-intent", { method: "POST" })
        .then((r) => r.json())
        .then((body: { clientSecret?: string }) => {
          if (body.clientSecret) setClientSecret(body.clientSecret);
        });
    }
  }, [configured, role]);

  if (role === "INSTRUCTOR") {
    return (
      <div>
        <h2 className="font-serif text-2xl text-palm-dark">Where should we send your earnings?</h2>
        <p className="mt-2 text-sm text-foreground/70">
          This is just where your teaching payouts will land once payments go live — not required to start
          setting your availability.
        </p>
        <input
          type="email"
          placeholder="you@example.com"
          value={payoutEmail}
          onChange={(e) => onPayoutEmailChange(e.target.value)}
          className="mt-4 w-full rounded-lg border border-stone-300 px-3 py-2"
        />
        <button
          onClick={onSavePayoutEmail}
          className="mt-4 w-full rounded-full bg-clay px-4 py-2 text-sm font-semibold text-white hover:bg-clay-dark"
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-serif text-2xl text-palm-dark">Add a payment method</h2>
      {configured === null && <p className="mt-3 text-sm text-foreground/60">Loading…</p>}

      {configured === false && (
        <>
          <p className="mt-3 text-sm text-foreground/70">
            Payment collection isn&apos;t live yet — you can browse and request classes right away. We&apos;ll
            let you know as soon as it&apos;s time to add a card.
          </p>
          <button onClick={onSkip} className="mt-4 w-full rounded-full bg-clay px-4 py-2 text-sm font-semibold text-white hover:bg-clay-dark">
            Continue
          </button>
        </>
      )}

      {configured && saved && (
        <>
          <p className="mt-3 text-sm text-palm-dark">Payment method saved. You&apos;re all set.</p>
          <button onClick={onSkip} className="mt-4 w-full rounded-full bg-clay px-4 py-2 text-sm font-semibold text-white hover:bg-clay-dark">
            Continue
          </button>
        </>
      )}

      {configured && !saved && clientSecret && stripePromise && (
        <div className="mt-4">
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CardSetupForm clientSecret={clientSecret} onDone={() => setSaved(true)} />
          </Elements>
          <button onClick={onSkip} className="mt-3 w-full text-center text-xs text-foreground/50 underline">
            Skip for now
          </button>
        </div>
      )}
    </div>
  );
}
