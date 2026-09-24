import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { requestInPersonSession, ClassSessionError } from "@/lib/classSessionService";

const RequestSchema = z.object({
  instructorId: z.string(),
  startTime: z.string(),
  locationAddress: z.string().min(1).max(500),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session || session.user.role !== "CLIENT") {
    return NextResponse.json({ error: "Only clients can request sessions." }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Missing instructor, date/time, or address." }, { status: 400 });
  }

  try {
    const result = await requestInPersonSession(parsed.data.instructorId, session.user.id, {
      startTime: new Date(parsed.data.startTime),
      locationAddress: parsed.data.locationAddress,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ClassSessionError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}
