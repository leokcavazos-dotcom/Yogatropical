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
npm run db:seed        # creates demo admin/instructor/client accounts, specialties, languages, price floors
npm run dev
```

You need a Postgres database to point `DATABASE_URL` at — either run one locally, or use a free one from
Vercel Postgres/Neon/Supabase even for local development.

Demo accounts (password `password123` for all): `admin@yogatropical.demo`, `instructor@yogatropical.demo`,
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
- **Pricing & commission**: each class length has a platform-set minimum price per student (seeded at $8 per
  20-minute block); instructors can price up to a configurable markup ceiling above that minimum (seeded at
  25%). The platform takes a 10% commission per booking, computed at request time (`src/lib/pricing.ts`).
- **Certification & quality control**: instructors upload certification documents (PDF/PNG/JPG) for admin
  review before they can publish classes or go available on demand (`isCertified` gate, enforced in
  `src/lib/classSessionService.ts`). Admins can rate/audit any class and flag one for follow-up, which holds
  its recording indefinitely instead of the default retention window.
- **Recordings**: the data model and retention lifecycle (`src/lib/recordings.ts`, default 7-day retention,
  configurable via `PlatformSettings.recordingRetentionDays`) are in place, but **actual video capture isn't
  wired up** — Jitsi's public server doesn't record by default. To turn this on, either self-host Jitsi with
  Jibri, or switch the video provider to one with a recording API (Daily.co, LiveKit, Zoom SDK) and populate
  `ClassSession.recordingPath` when a recording finishes. Run `purgeExpiredRecordings()` on a schedule (cron /
  serverless function) once real recordings exist.

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

Pricing and commission math is fully implemented — `Enrollment.priceCharged` and `commissionAmount` are
computed and stored on every request — but no money moves until Stripe is actually configured.

The onboarding payment step is real, working Stripe integration (a `SetupIntent` + Stripe Elements
`CardElement`, so raw card numbers never touch our server) that simply stays inactive — showing a friendly
"coming soon" message instead — until `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` are set.
Once they are, clients get a real "add a payment method" step and `src/app/api/payments/setup-intent/route.ts`
creates a Stripe customer + SetupIntent per user (`User.stripeCustomerId`). Instructors instead set a
`payoutEmail` (just a payout destination, no card/bank data collected there).

What's still missing for money to actually move: charging the client's saved payment method and splitting
`commissionAmount` to the platform vs. the rest to the instructor at the point an enrollment is accepted —
Stripe Connect is a natural fit for that split. That part isn't built yet.

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

There's one reserved, opt-in ad placement on the browse page (`src/components/AdSlot.tsx`, controlled by
`NEXT_PUBLIC_AD_SLOT_BROWSE_IMAGE_URL` / `_LINK_URL`). It renders nothing at all when unset — not a
placeholder box — so it's genuinely non-intrusive until there's a real ad to show. No ad network is wired up;
this is just the reserved slot in the layout.

The idea of ads (and merch store revenue, below) feeding into the same eventual instructor profit-sharing pool
as commission revenue is still just that — an idea, not implemented. See "Business model & governance."

## Not yet built (roadmap)

- **Merchandise store** (mats, tai chi/yoga gear, etc.) — a separate product catalog, cart, and checkout flow.
  Not started; would live alongside the booking flow as its own module.
- Actual ad network integration (see "Ads & other revenue streams" above — only the placement is reserved).
- Charging clients and splitting payouts to instructors (see "Payments" above).
- Actual video recording capture (see "Recordings" above).
- Cooperative governance/voting tooling — deliberately deferred; see "Business model & governance."
- Real onboarding videos — the video slot is wired up (see "Onboarding" above), but no video file exists yet.

## Project structure

- `prisma/schema.prisma` — data model (users/roles, instructor profiles, specialties, languages,
  certifications, safety acknowledgments, class sessions, enrollments, class audits, platform
  settings/price floors)
- `src/lib/` — business logic: `pricing.ts` (price bands + commission), `classSessionService.ts`
  (create/request/accept/decline + on-demand, all waiver-gated), `certificationStorage.ts` (local file
  storage, swap for S3/GCS in production), `recordings.ts`, `video.ts` (Jitsi room helpers), `waiver.ts`
  (safety waiver text + version), `stripe.ts`, `onboarding.ts`, `auth.ts`
- `src/app/api/` — REST-ish route handlers backing all of the above
- `src/app/(pages)` — `/`, `/browse`, `/about`, `/guidelines`, `/login`, `/signup`, `/onboarding`,
  `/dashboard/{client,instructor,admin}`, `/room/[id]`
- `src/components/` — `PalmTreeLogo.tsx` (the one-tree mark used in the nav bar and onboarding),
  `WelcomeVideo.tsx`, `AdSlot.tsx`, `OnboardingBanner.tsx`, `onboarding/PaymentMethodStep.tsx`
