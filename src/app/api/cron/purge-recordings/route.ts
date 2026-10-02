import { NextResponse } from "next/server";
import { purgeExpiredRecordings } from "@/lib/recordings";

// Called once a day by the Vercel cron in vercel.json. Vercel sends
// "Authorization: Bearer $CRON_SECRET"; anything else is turned away.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const result = await purgeExpiredRecordings();
  return NextResponse.json(result);
}
