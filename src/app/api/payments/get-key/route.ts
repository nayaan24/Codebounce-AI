import { NextResponse } from "next/server";

export async function GET() {
  // Return the Razorpay key ID (safe to expose on client)
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";

  return NextResponse.json({ keyId });
}

