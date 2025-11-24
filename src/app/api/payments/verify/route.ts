import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getUser } from "@/auth/stack-auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await req.json();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify payment signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(text)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // TODO: Save subscription to database
    // Example:
    // await db.insert(subscriptionsTable).values({
    //   userId: user.userId,
    //   plan: "pro",
    //   razorpayOrderId: razorpay_order_id,
    //   razorpayPaymentId: razorpay_payment_id,
    //   status: "active",
    //   expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    // });

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}

