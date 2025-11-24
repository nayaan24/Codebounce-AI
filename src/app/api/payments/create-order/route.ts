import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getUser } from "@/auth/stack-auth";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    const { plan, amount } = await req.json();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (plan !== "pro") {
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const options = {
      amount: amount, // Amount in paise (85900 = ₹859)
      currency: "INR",
      receipt: `order_${user.userId}_${Date.now()}`,
      notes: {
        userId: user.userId,
        plan: plan,
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

