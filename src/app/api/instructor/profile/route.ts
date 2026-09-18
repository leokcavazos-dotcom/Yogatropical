import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ALLOWED_DURATIONS_MINUTES, getPriceBand, validatePriceAgainstBand } from "@/lib/pricing";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "INSTRUCTOR") {
    return NextResponse.json({ error: "Instructors only." }, { status: 403 });
  }
  const profile = await prisma.instructorProfile.findUnique({
    where: { userId: session.user.id },
    include: { specialties: true, languages: true, certifications: true },
  });
  return NextResponse.json(profile);
}

const UpdateProfileSchema = z.object({
  bio: z.string().max(2000).optional(),
  specialtyIds: z.array(z.string()).optional(),
  languageIds: z.array(z.string()).optional(),
  isAvailableOnDemand: z.boolean().optional(),
  onDemandDurationMinutes: z.number().nullable().optional(),
  onDemandCapacity: z.number().nullable().optional(),
  onDemandPricePerStudent: z.number().nullable().optional(),
});

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session || session.user.role !== "INSTRUCTOR") {
    return NextResponse.json({ error: "Instructors only." }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  const parsed = UpdateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid profile data." }, { status: 400 });
  }
  const data = parsed.data;

  if (data.isAvailableOnDemand) {
    const duration = data.onDemandDurationMinutes;
    const price = data.onDemandPricePerStudent;
    if (!duration || !ALLOWED_DURATIONS_MINUTES.includes(duration as never)) {
      return NextResponse.json({ error: "Pick a valid on-demand class length." }, { status: 400 });
    }
    if (!price) {
      return NextResponse.json({ error: "Set a price per student for on-demand sessions." }, { status: 400 });
    }
    const band = await getPriceBand(duration);
    const priceError = validatePriceAgainstBand(price, band);
    if (priceError) return NextResponse.json({ error: priceError }, { status: 400 });
    if (data.onDemandCapacity != null && data.onDemandCapacity < 1) {
      return NextResponse.json({ error: "Capacity must be at least 1, or left unset for unlimited." }, { status: 400 });
    }

    const profile = await prisma.instructorProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile?.isCertified) {
      return NextResponse.json(
        { error: "Your certification is still pending review, so you can't go available on demand yet." },
        { status: 400 },
      );
    }
  }

  const updated = await prisma.instructorProfile.update({
    where: { userId: session.user.id },
    data: {
      bio: data.bio,
      isAvailableOnDemand: data.isAvailableOnDemand,
      onDemandDurationMinutes: data.onDemandDurationMinutes,
      onDemandCapacity: data.onDemandCapacity,
      onDemandPricePerStudent: data.onDemandPricePerStudent,
      ...(data.specialtyIds ? { specialties: { set: data.specialtyIds.map((id) => ({ id })) } } : {}),
      ...(data.languageIds ? { languages: { set: data.languageIds.map((id) => ({ id })) } } : {}),
    },
    include: { specialties: true, languages: true },
  });

  return NextResponse.json(updated);
}
