import { NextResponse } from "next/server";
import { sendDueReminders } from "@/lib/reminders";

// Called every 15 minutes by the GitHub Actions workflow in
// .github/workflows/reminders.yml (Vercel's free plan only runs crons once a
// day). It sends "Authorization: Bearer $CRON_SECRET"; anything else is turned away.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return NextResponse.json(await sendDueReminders());
}
