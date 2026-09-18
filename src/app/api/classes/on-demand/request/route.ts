import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { requestOnDemandSession, ClassSessionError } from "@/lib/classSessionService";

const RequestSchema = z.object({ instructorId: z.string() });

export async function POST(request: Request) {
  const session = await auth();
  if (!session || session.user.role !== "CLIENT") {
    return NextResponse.json({ error: "Only clients can request sessions." }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Missing instructor." }, { status: 400 });

  try {
    const result = await requestOnDemandSession(parsed.data.instructorId, session.user.id);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ClassSessionError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}
