import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isValidTimeZone } from "@/lib/email";
import { getLocale } from "@/i18n/server";

const Schema = z.object({
  emailReminders: z.boolean().optional(),
  timeZone: z.string().max(64).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id }, select: { emailReminders: true } });
  return NextResponse.json(user);
}

// Also records the site language and the browser's time zone, so reminder emails match what the person sees here.
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const parsed = Schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid reminder settings." }, { status: 400 });
  const { emailReminders, timeZone } = parsed.data;

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      emailReminders,
      locale: await getLocale(),
      ...(timeZone && isValidTimeZone(timeZone) ? { timeZone } : {}),
    },
    select: { emailReminders: true },
  });
  return NextResponse.json(user);
}
