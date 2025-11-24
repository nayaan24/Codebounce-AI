import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { plan } = await req.json();
    
    if (plan !== "free" && plan !== "pro") {
      return NextResponse.json(
        { error: "Invalid plan. Must be 'free' or 'pro'" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    cookieStore.set("TEST_USER_PLAN", plan, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: false,
      sameSite: "lax",
    });

    return NextResponse.json({ success: true, plan });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to set test plan" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const plan = cookieStore.get("TEST_USER_PLAN")?.value || "free";
  return NextResponse.json({ plan });
}

