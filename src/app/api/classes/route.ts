import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createScheduledClass, ClassSessionError } from "@/lib/classSessionService";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date"); // YYYY-MM-DD
  const duration = searchParams.get("duration");
  const specialtyId = searchParams.get("specialtyId");
  const languageId = searchParams.get("languageId");
  const deliveryMethod = searchParams.get("deliveryMethod"); // VIRTUAL | IN_PERSON

  const where: Record<string, unknown> = {
    mode: "SCHEDULED",
    status: "OPEN",
  };

  if (date) {
    const start = new Date(`${date}T00:00:00`);
    const end = new Date(`${date}T23:59:59.999`);
    where.startTime = { gte: start, lte: end };
  } else {
    where.startTime = { gte: new Date() };
  }
  if (duration) where.durationMinutes = Number(duration);
  if (specialtyId) where.specialties = { some: { id: specialtyId } };
  if (languageId) where.languages = { some: { id: languageId } };
  if (deliveryMethod === "VIRTUAL" || deliveryMethod === "IN_PERSON") where.deliveryMethod = deliveryMethod;

  const classes = await prisma.classSession.findMany({
    where,
    orderBy: { startTime: "asc" },
    include: {
      instructor: { select: { id: true, name: true, instructorProfile: { select: { bio: true } } } },
      specialties: true,
      languages: true,
      _count: { select: { enrollments: { where: { status: "ACCEPTED" } } } },
    },
  });

  return NextResponse.json(classes);
}

const CreateClassSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  startTime: z.string(),
  durationMinutes: z.number(),
  capacity: z.number().nullable(),
  pricePerStudent: z.number(),
  specialtyIds: z.array(z.string()).min(1),
  languageIds: z.array(z.string()).min(1),
  deliveryMethod: z.enum(["VIRTUAL", "IN_PERSON"]).optional(),
  locationAddress: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session || session.user.role !== "INSTRUCTOR") {
    return NextResponse.json({ error: "Only instructors can publish classes." }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  const parsed = CreateClassSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid class details." }, { status: 400 });

  try {
    const created = await createScheduledClass({
      instructorId: session.user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      startTime: new Date(parsed.data.startTime),
      durationMinutes: parsed.data.durationMinutes,
      capacity: parsed.data.capacity,
      pricePerStudent: parsed.data.pricePerStudent,
      specialtyIds: parsed.data.specialtyIds,
      languageIds: parsed.data.languageIds,
      deliveryMethod: parsed.data.deliveryMethod,
      locationAddress: parsed.data.locationAddress,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof ClassSessionError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}
