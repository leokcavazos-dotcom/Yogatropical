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
    if (result.error) {
      setSubmitting(false);
      setError(result.error.message ?? "Couldn't save that card.");
      return;
    }
    const paymentMethodId =
      typeof result.setupIntent?.payment_method === "string" ? result.setupIntent.payment_method : null;
    if (paymentMethodId) {
      await fetch("/api/payments/confirm-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethodId }),
      });
    }
    setSubmitting(false);
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

interface ConnectStatus {
  configured: boolean;
  connected: boolean;
  payoutsEnabled: boolean;
}

function InstructorConnectStep({ onSkip }: { onSkip: () => void }) {
  const [status, setStatus] = useState<ConnectStatus | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/instructor/connect/status")
      .then((r) => r.json())
      .then(setStatus);
  }, []);

  async function connect() {
    setMessage(null);
    setLoading(true);
    const res = await fetch("/api/instructor/connect/onboard", { method: "POST" });
    const body = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok || !body.url) {
      setMessage(body.error ?? "Couldn't start Stripe setup.");
      return;
    }
    window.location.href = body.url;
  }

  return (
    <div>
      <h2 className="font-serif text-2xl text-palm-dark">Connect your Stripe account</h2>
      <p className="mt-2 text-sm text-foreground/70">
        This is how your teaching payouts reach you — Stripe handles a quick verification, then pays you
        automatically for every class, right after your commission is taken out. Not required to start setting
        your availability.
      </p>

      {status === null && <p className="mt-4 text-sm text-foreground/60">Loading…</p>}

      {status?.configured === false && (
        <p className="mt-4 text-sm text-foreground/70">
          Payouts aren&apos;t live yet — you can set up your profile and certification right away. We&apos;ll let
          you know as soon as it&apos;s time to connect Stripe.
        </p>
      )}

      {status?.configured && status.payoutsEnabled && (
        <p className="mt-4 text-sm text-palm-dark">Your Stripe account is connected and ready for payouts.</p>
      )}

      {status?.configured && !status.payoutsEnabled && (
        <>
          {message && <p className="mt-3 text-sm text-red-600">{message}</p>}
          <button
            onClick={connect}
            disabled={loading}
            className="mt-4 w-full rounded-full bg-palm px-4 py-2 text-sm font-semibold text-white hover:bg-palm-dark disabled:opacity-60"
          >
            {loading ? "One moment…" : status.connected ? "Finish connecting Stripe" : "Connect your Stripe account"}
          </button>
        </>
      )}

      <button
        onClick={onSkip}
        className="mt-4 w-full rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-foreground/70 hover:bg-stone-50"
      >
        Continue
      </button>
    </div>
  );
}

interface PaymentMethodStepProps {
  role: "CLIENT" | "INSTRUCTOR" | "ADMIN";
  onSkip: () => void;
}

export default function PaymentMethodStep({ role, onSkip }: PaymentMethodStepProps) {
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
    return <InstructorConnectStep onSkip={onSkip} />;
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
