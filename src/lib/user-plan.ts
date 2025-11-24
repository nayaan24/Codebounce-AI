"use server";

import { getUser } from "@/auth/stack-auth";
import { cookies } from "next/headers";

/**
 * Check if user is on pro plan
 * For testing: Use cookie to override (set TEST_USER_PLAN=pro or free)
 */
export async function isProUser(): Promise<boolean> {
  // Check for test override cookie
  const cookieStore = await cookies();
  const testPlan = cookieStore.get("TEST_USER_PLAN")?.value;
  
  if (testPlan === "pro") {
    return true;
  }
  if (testPlan === "free") {
    return false;
  }

  try {
    const user = await getUser();
    
    // TODO: Check actual subscription from database
    // For now, default to free (all users are free by default)
    // const subscription = await db.select().from(subscriptionsTable)
    //   .where(eq(subscriptionsTable.userId, user.userId))
    //   .limit(1);
    // return subscription[0]?.plan === "pro" && subscription[0]?.status === "active";
    
    return false; // Default to free
  } catch {
    return false; // Not logged in = free
  }
}

/**
 * Set test user plan (for testing toggle)
 */
export async function setTestUserPlan(plan: "free" | "pro") {
  const cookieStore = await cookies();
  cookieStore.set("TEST_USER_PLAN", plan, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    httpOnly: false, // Allow client-side access for toggle
    sameSite: "lax",
  });
}

