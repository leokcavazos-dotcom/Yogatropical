import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { WAIVER_VERSION } from "@/lib/waiver";

const Schema = z.object({ signedName: z.string().trim().min(2).max(120) });

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Type your full name to sign the waiver." }, { status: 400 });
  }

  const acknowledgment = await prisma.safetyAcknowledgment.upsert({
    where: { userId_version: { userId: session.user.id, version: WAIVER_VERSION } },
    update: {},
    create: {
      userId: session.user.id,
      version: WAIVER_VERSION,
      signedName: parsed.data.signedName,
    },
  });

  return NextResponse.json(acknowledgment, { status: 201 });
}
