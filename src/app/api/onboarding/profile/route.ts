import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const Schema = z.object({
  phone: z.string().max(30).optional(),
  preferredLanguageId: z.string().nullable().optional(),
});

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid profile data." }, { status: 400 });

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: parsed.data,
  });
  return NextResponse.json({ phone: updated.phone, preferredLanguageId: updated.preferredLanguageId });
}
