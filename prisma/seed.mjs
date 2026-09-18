import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SPECIALTIES = [
  { name: "Ashtanga-inspired Flow", slug: "ashtanga-inspired-flow" },
  { name: "Vinyasa-inspired Flow", slug: "vinyasa-inspired-flow" },
  { name: "Hatha-inspired Yoga", slug: "hatha-inspired-yoga" },
  { name: "Kundalini-inspired Yoga", slug: "kundalini-inspired-yoga" },
  { name: "Restorative & Yin-inspired Yoga", slug: "restorative-yin-inspired-yoga" },
  { name: "Chair Yoga", slug: "chair-yoga" },
  { name: "Tai Chi-inspired Movement", slug: "tai-chi-inspired-movement" },
  { name: "Qigong-inspired Breath & Movement", slug: "qigong-inspired-breath-movement" },
  { name: "Guided Meditation", slug: "guided-meditation" },
  { name: "Breathwork", slug: "breathwork" },
  { name: "Gentle Stretching", slug: "gentle-stretching" },
];

const LANGUAGES = [
  "English",
  "Spanish",
  "Portuguese",
  "French",
  "Haitian Creole",
  "Quechua",
  "Guarani",
  "Nahuatl",
  "Jamaican Patois",
];

// $8 per 20-minute block, applied across the allowed class lengths.
const PRICE_FLOORS = [20, 40, 60, 80, 100, 120].map((durationMinutes) => ({
  durationMinutes,
  minPricePerStudent: (durationMinutes / 20) * 8,
}));

async function main() {
  await prisma.platformSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton", commissionPercent: 10, maxMarkupPercent: 25, recordingRetentionDays: 7 },
  });

  for (const floor of PRICE_FLOORS) {
    await prisma.priceFloor.upsert({
      where: { durationMinutes: floor.durationMinutes },
      update: { minPricePerStudent: floor.minPricePerStudent },
      create: floor,
    });
  }

  for (const specialty of SPECIALTIES) {
    await prisma.specialty.upsert({
      where: { slug: specialty.slug },
      update: { name: specialty.name },
      create: specialty,
    });
  }

  for (const name of LANGUAGES) {
    await prisma.language.upsert({ where: { name }, update: {}, create: { name } });
  }

  // Reference data (specialties/languages/price floors/platform settings) is
  // always safe to seed. Demo login accounts are only for trying the app out —
  // skip them in a real production database with SEED_DEMO_ACCOUNTS=false.
  if (process.env.SEED_DEMO_ACCOUNTS === "false") {
    console.log("Seed complete (reference data only, demo accounts skipped).");
    return;
  }

  const demoPasswordHash = await bcrypt.hash("password123", 10);

  await prisma.user.upsert({
    where: { email: "admin@yogatropical.demo" },
    update: {},
    create: {
      name: "Yoga Tropical Admin",
      email: "admin@yogatropical.demo",
      passwordHash: demoPasswordHash,
      role: "ADMIN",
    },
  });

  const hatha = await prisma.specialty.findUnique({ where: { slug: "hatha-inspired-yoga" } });
  const breathwork = await prisma.specialty.findUnique({ where: { slug: "breathwork" } });
  const english = await prisma.language.findUnique({ where: { name: "English" } });
  const spanish = await prisma.language.findUnique({ where: { name: "Spanish" } });

  const instructorUser = await prisma.user.upsert({
    where: { email: "instructor@yogatropical.demo" },
    update: {},
    create: {
      name: "Maria Alegria",
      email: "instructor@yogatropical.demo",
      passwordHash: demoPasswordHash,
      role: "INSTRUCTOR",
    },
  });

  await prisma.instructorProfile.upsert({
    where: { userId: instructorUser.id },
    update: {},
    create: {
      userId: instructorUser.id,
      bio: "Bilingual (English/Spanish) instructor supporting folks in recovery through gentle, breath-led movement. Certified and approved for quality review.",
      isCertified: true,
      specialties: { connect: [{ id: hatha.id }, { id: breathwork.id }] },
      languages: { connect: [{ id: english.id }, { id: spanish.id }] },
    },
  });

  await prisma.user.upsert({
    where: { email: "client@yogatropical.demo" },
    update: {},
    create: {
      name: "Jordan Rivers",
      email: "client@yogatropical.demo",
      passwordHash: demoPasswordHash,
      role: "CLIENT",
    },
  });

  console.log("Seed complete. Demo login password for all demo accounts: password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
