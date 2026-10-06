import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { TERMS_VERSION } from "@/lib/legal";

const RegisterSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(200),
  role: z.enum(["CLIENT", "INSTRUCTOR"]),
  acceptedTerms: z.literal(true),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check your name, email, and password, and confirm you're 18+ and agree to the terms." },
      { status: 400 },
    );
  }

  const { name, email, password, role } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      passwordHash,
      role,
      guidelinesAcceptedAt: new Date(),
      termsAcceptedAt: new Date(),
      termsVersion: TERMS_VERSION,
    },
  });

  if (role === "INSTRUCTOR") {
    await prisma.instructorProfile.create({ data: { userId: user.id } });
  }

  return NextResponse.json({ id: user.id, email: user.email, role: user.role }, { status: 201 });
}
