# Yoga Tropical

A live, online booking platform for yoga-inspired, tai chi-inspired, breathwork, meditation, and stretching
classes — built for a secular, recovery-friendly community. See `/about` and `/guidelines` in the running app
for the full mission and Code of Conduct.

## Stack

- **Next.js (App Router) + TypeScript + Tailwind CSS**
- **Prisma + SQLite** for data (swap `DATABASE_URL` for a Postgres connection string in production — the schema
  doesn't use any SQLite-specific features)
- **Auth.js (NextAuth v5)** with a credentials (email/password) provider and JWT sessions — no separate
  Account/Session tables needed
- **Jitsi Meet** (public server, no account required) for the live video rooms

## Getting started

```bash
npm install
cp .env.example .env   # then edit AUTH_SECRET, etc.
npx prisma migrate dev
npm run db:seed        # creates demo admin/instructor/client accounts, specialties, languages, price floors
npm run dev
```

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

## Payments

Pricing and commission math is fully implemented, but no money actually moves yet — `Enrollment.priceCharged`
and `commissionAmount` are computed and stored, but there's no payment collection. To go live, wire Stripe (or
similar) at the point an enrollment is accepted: create a PaymentIntent/Checkout Session for `priceCharged`,
and split `commissionAmount` to the platform vs. the rest to the instructor (Stripe Connect is a natural fit
for the split). `.env.example` has placeholders for Stripe keys.

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
    instructors as a profit-sharing pool, weighted by a workload formula that hasn't been defined yet.
  - None of the above is implemented in code — it's intentionally left as policy/config to define later, and
    `ClassSession`/`Enrollment` records already carry the instructor, duration, and date data needed to compute
    tenure and hours-taught whenever that formula is ready.

## Not yet built (roadmap)

- **Merchandise store** (mats, tai chi/yoga gear, etc.) — a separate product catalog, cart, and checkout flow.
  Not started; would live alongside the booking flow as its own module.
- Real payment collection (see "Payments" above).
- Actual video recording capture (see "Recordings" above).
- Cooperative governance/voting tooling — deliberately deferred; see "Business model & governance."

## Project structure

- `prisma/schema.prisma` — data model (users/roles, instructor profiles, specialties, languages,
  certifications, class sessions, enrollments, class audits, platform settings/price floors)
- `src/lib/` — business logic: `pricing.ts` (price bands + commission), `classSessionService.ts`
  (create/request/accept/decline + on-demand), `certificationStorage.ts` (local file storage, swap for
  S3/GCS in production), `recordings.ts`, `video.ts` (Jitsi room helpers), `auth.ts`
- `src/app/api/` — REST-ish route handlers backing all of the above
- `src/app/(pages)` — `/`, `/browse`, `/about`, `/guidelines`, `/login`, `/signup`,
  `/dashboard/{client,instructor,admin}`, `/room/[id]`
