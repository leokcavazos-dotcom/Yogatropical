import { NextResponse } from "next/server";
import { isPaymentsConfigured } from "@/lib/stripe";

export async function GET() {
  return NextResponse.json({ configured: isPaymentsConfigured() });
}
