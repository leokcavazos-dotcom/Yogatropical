import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { findCountry } from "@/lib/countries";
import { CLIENT_AGE_RANGES } from "@/lib/profileOptions";

async function loadProfile(userId: string) {
  const [user, profile] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { name: true, photoPath: true } }),
    prisma.clientProfile.findUnique({ where: { userId }, include: { languages: true } }),
  ]);
  return { userId, name: user.name, hasPhoto: Boolean(user.photoPath), profile };
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  return NextResponse.json(await loadProfile(session.user.id));
}

const Schema = z.object({
  aboutMe: z.string().max(2000),
  whatBringsYou: z.string().max(2000),
  ageRange: z.enum(CLIENT_AGE_RANGES).nullable(),
  notesForInstructors: z.string().max(2000),
  prefersVirtual: z.boolean(),
  prefersInPerson: z.boolean(),
  country: z
    .string()
    .refine((code) => Boolean(findCountry(code)), "Unknown country.")
    .nullable(),
  area: z.string().max(200).nullable(),
  languageIds: z.array(z.string()).max(20),
});

export async function PUT(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid profile data." }, { status: 400 });
  const { languageIds, ...fields } = parsed.data;
  const languages = languageIds.map((id) => ({ id }));

  await prisma.clientProfile.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...fields, languages: { connect: languages } },
    update: { ...fields, languages: { set: languages } },
  });
  return NextResponse.json(await loadProfile(session.user.id));
}
