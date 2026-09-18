import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const languages = await prisma.language.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(languages);
}

const CreateLanguageSchema = z.object({ name: z.string().min(1).max(60) });

// Lets an instructor add a language that isn't in the seeded list yet
// (the point of "whatever languages ... it doesn't really matter as long
// as the instructor can speak it").
export async function POST(request: Request) {
  const session = await auth();
  if (!session || session.user.role !== "INSTRUCTOR") {
    return NextResponse.json({ error: "Only instructors can add languages." }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  const parsed = CreateLanguageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Provide a language name." }, { status: 400 });
  }
  const language = await prisma.language.upsert({
    where: { name: parsed.data.name },
    update: {},
    create: { name: parsed.data.name },
  });
  return NextResponse.json(language, { status: 201 });
}
