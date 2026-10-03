# Yoga Tropical

A live, online booking platform for yoga-inspired, tai chi-inspired, breathwork, meditation, and stretching
classes — built for a secular, recovery-friendly community. See `/about` and `/guidelines` in the running app
for the full mission and Code of Conduct.

## Stack

- **Next.js (App Router) + TypeScript + Tailwind CSS**
- **Prisma + Postgres** for data (works with any Postgres host — Vercel Postgres, Neon, Supabase, Railway, or
  a local instance for development)
- **Auth.js (NextAuth v5)** with a credentials (email/password) provider and JWT sessions — no separate
  Account/Session tables needed
- **Jitsi Meet** (public server, no account required) for the live video rooms
- **Stripe** (`stripe`, `@stripe/stripe-js`, `@stripe/react-stripe-js`) for the onboarding payment step —
  dormant until API keys are set, see "Payments"

## Getting started

```bash
npm install
cp .env.example .env   # then edit DATABASE_URL, AUTH_SECRET, etc.
npx prisma migrate dev
npm run db:seed        # specialties, languages, platform settings
SEED_DEMO_ACCOUNTS=true npm run db:seed   # also demo admin/instructor/client accounts (local only)
npm run dev
```

You need a Postgres database to point `DATABASE_URL` at — either run one locally, or use a free one from
Vercel Postgres/Neon/Supabase even for local development.

Demo accounts (with `SEED_DEMO_ACCOUNTS=true`; password `password123` for all): `admin@yogatropical.demo`, `instructor@yogatropical.demo`,
`client@yogatropical.demo`.

## How the booking model works

- **Scheduled classes**: an approved instructor publishes a class (date, time, one of 20/40/60/80/100/120
  minutes, capacity or unlimited, price per student). Clients browse by date/duration/specialty/language and
  request a seat. The instructor must accept each request — up to capacity — before it's a confirmed booking.
- **On-demand classes**: an instructor flips "available now," sets a duration/price/capacity for on-demand
  sessions, and clients can request an instant session. Accepting the request starts the class immediately.
- **Video**: every class gets a unique Jitsi Meet room. The room link only appears to the instructor and to
  clients whose booking has been accepted (`/room/[classSessionId]`, authorization enforced server-side).
- **Languages**: instructors tag which language(s) they teach in (seeded with English, Spanish, Portuguese,
  French, Haitian Creole, Quechua, Guarani, Nahuatl, Jamaican Patois — instructors can add others), and classes
  can be single-language or hybrid/bilingual. Clients filter by language when browsing.
- **Pricing & commission**: minimum price per student is $20/hour for virtual classes worldwide and a
  per-hour minimum for in-person classes set by the instructor's country tier ($25 / $15 / $8, see
  `src/lib/countries.ts` and `src/lib/pricingRules.ts`), scaled by class length; there is no maximum. The platform takes a 10% commission per booking, computed at request time (`src/lib/pricing.ts`).
- **Certification & quality control**: instructors upload certification documents (PDF/PNG/JPG) for admin
  review before they can publish classes or go available on demand (`isCertified` gate, enforced in
  `src/lib/classSessionService.ts`). Admins can rate/audit any class and flag one for follow-up, which holds
  its recording indefinitely instead of the default retention window.
- **Video & recordings**: virtual classes run in private Daily (daily.co) rooms (`src/lib/video.ts`), embedded
  on `/room/[id]` with Daily's built-in camera/microphone check. Only the instructor and accepted students get a
  meeting token. The instructor's token starts a cloud recording automatically; recordings stay at Daily and a
  daily Vercel cron (`vercel.json` → `/api/cron/purge-recordings`, protected by `CRON_SECRET`) deletes them after
  `PlatformSettings.recordingRetentionDays` (default 7), except for classes an admin has flagged. Admins open
  recordings from the Quality control list. `/room/test` gives any signed-in user an unrecorded practice room.
  Without `DAILY_API_KEY`, rooms fall back to the public meet.jit.si test server (5-minute limit, no recording).

## Onboarding

New accounts land on `/onboarding` (a short, 4-screen wizard — welcome, quick profile, safety waiver, payment)
before their dashboard, rather than being dropped straight in:

1. **Welcome** — a role-aware video slot (`src/components/WelcomeVideo.tsx`). Point
   `NEXT_PUBLIC_WELCOME_VIDEO_CLIENT_URL` / `_INSTRUCTOR_URL` at a video file (an AI-generated one to start,
   real footage later — either way, no code changes needed) and it plays; leave them unset and a designed
   gradient panel with the palm tree mark shows instead, so the step never looks broken.
2. **Quick profile** — clients set an optional phone/preferred language; instructors set bio/specialties/
   languages (the same fields as their dashboard profile, just condensed into the wizard).
3. **Safety waiver** — the health & safety text in `src/lib/waiver.ts` (pregnancy/high blood pressure/consult
   a physician/stop if it hurts), signed by typing your name. This is a **hard gate**, not just a checkbox:
   `requestEnrollment`, `createScheduledClass`, and `requestOnDemandSession` in
   `src/lib/classSessionService.ts` all refuse to proceed until `SafetyAcknowledgment` has a row for that
   user at the current `WAIVER_VERSION`. Bumping `WAIVER_VERSION` invalidates old signatures and re-prompts
   everyone next time they try to book or publish.
4. **Payment** — see "Payments" below.

Anyone who hasn't signed the current waiver sees a small "Finish onboarding" banner on their dashboard
(`src/components/OnboardingBanner.tsx`, wired in via `src/app/dashboard/layout.tsx`).

## Payments

Real money moves via Stripe Connect, gated behind `STRIPE_SECRET_KEY` /
`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` / `STRIPE_WEBHOOK_SECRET` — until all three are set, publishing
classes, going available, and payment collection all stay in a friendly "coming soon" state, same as before.

- **Clients** save a card during onboarding (`SetupIntent` + Stripe Elements `CardElement`, so raw card
  numbers never touch our server) via `src/app/api/payments/setup-intent/route.ts`, and it's set as their
  Stripe customer's default payment method via `src/app/api/payments/confirm-setup/route.ts`.
- **Instructors** connect a Stripe Express account (`src/app/api/instructor/connect/onboard/route.ts` mints
  a Stripe-hosted onboarding link; `.../connect/status/route.ts` checks whether payouts are enabled) instead
  of entering a payout email. Publishing a class or going available on-demand/in-person is blocked until
  `InstructorProfile.payoutsEnabled` is true.
- **Charging happens at acceptance**: when an instructor accepts a booking (`respondToEnrollment` in
  `src/lib/classSessionService.ts`), a destination PaymentIntent charges the client and automatically splits
  the money — `commissionAmount` stays with the platform, the rest transfers straight to the instructor's
  connected account. A declined card marks the enrollment `PAYMENT_FAILED` instead of `ACCEPTED`.
- **Cancelling** an already-paid, accepted booking (`cancelEnrollment`) issues a Stripe refund that reverses
  both the transfer and the platform's commission.
- **`src/app/api/stripe/webhook/route.ts`** is a reconciliation safety net for Connect account status changes
  and payment/refund events, in case the synchronous path above is ever interrupted.

## Business model & governance (in progress)

- **First ~3 years**: Yoga Tropical operates as an LLC. Flat 10% commission, no profit-sharing.
- **Goal beyond that**: transition toward an instructor cooperative. Still being worked out, but the direction
  under discussion:
  - Instructors with 1+ year of tenure, averaging 20+ hours of classes per week, become voting members.
  - Voting members elect an instructor council to handle day-to-day decisions, including quality control and
    teacher regulation.
  - Possibly capping the platform's commission per booking (~$100 floated as a rough number).
  - Possibly a tiered commission (e.g., ~10% for new instructors, ~8% for tenured/loyal ones), still under
    the same rough cap.
  - Once the cooperative is running, sharing a percentage of commission revenue (~10% floated) back to
    instructors as a profit-sharing pool, weighted by a workload formula that hasn't been defined yet —
    possibly with merch store and ad revenue feeding the same pool alongside commission.
  - None of the above is implemented in code — it's intentionally left as policy/config to define later, and
    `ClassSession`/`Enrollment` records already carry the instructor, duration, and date data needed to compute
    tenure and hours-taught whenever that formula is ready.

## Ads & other revenue streams

- **Ad bar** (`src/components/AdBar.tsx`): slim banners labeled "Sponsored" on the home, browse, and store
  pages. Admins upload them in the admin dashboard (image, link, where it shows, on/off); one random active ad
  shows per placement, and nothing renders when there isn't one. No ad network is wired up.
- **Store** (`/store`): curated affiliate products in three tiers (Luxe / Everyday / Budget-friendly) with
  hashtag filters, managed in the admin dashboard. Products link out to the retailer, who sells and ships them;
  links carry `rel="sponsored"` and the page shows an affiliate disclosure.

The idea of ads (and store affiliate revenue) feeding into the same eventual instructor profit-sharing pool
as commission revenue is still just that — an idea, not implemented. See "Business model & governance."

## Not yet built (roadmap)

- Our own merchandise with a cart and checkout (the current store is affiliate links only).
- Ad network integration (ads are uploaded manually by admins for now).
- Charging clients and splitting payouts to instructors (see "Payments" above).
- Cooperative governance/voting tooling — deliberately deferred; see "Business model & governance."
- Real onboarding videos — the video slot is wired up (see "Onboarding" above), but no video file exists yet.

## Project structure

- `prisma/schema.prisma` — data model (users/roles, instructor profiles, specialties, languages,
  certifications, safety acknowledgments, class sessions, enrollments, class audits, platform
  settings)
- `src/lib/` — business logic: `pricing.ts` + `pricingRules.ts` (minimum prices + commission), `classSessionService.ts`
  (create/request/accept/decline + on-demand, all waiver-gated), `certificationStorage.ts` (Vercel Blob
  in production, local disk fallback for dev), `recordings.ts`, `video.ts` (Daily rooms, tokens, recordings),
  `waiver.ts` (safety waiver text + version), `stripe.ts`, `onboarding.ts`, `auth.ts`
- `src/app/api/` — REST-ish route handlers backing all of the above
- `src/app/(pages)` — `/`, `/browse`, `/about`, `/guidelines`, `/login`, `/signup`, `/onboarding`,
  `/dashboard/{client,instructor,admin}`, `/room/[id]`
- `src/components/` — `PalmTreeLogo.tsx` (the one-tree mark used in the nav bar and onboarding),
  `WelcomeVideo.tsx`, `AdBar.tsx`, `OnboardingBanner.tsx`, `onboarding/PaymentMethodStep.tsx`
