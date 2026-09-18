import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { requestEnrollment, ClassSessionError } from "@/lib/classSessionService";

const RequestSchema = z.object({ classSessionId: z.string() });

export async function POST(request: Request) {
  const session = await auth();
  if (!session || session.user.role !== "CLIENT") {
    return NextResponse.json({ error: "Only clients can book classes." }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Missing class." }, { status: 400 });

  try {
    const enrollment = await requestEnrollment(parsed.data.classSessionId, session.user.id);
    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    if (error instanceof ClassSessionError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}
