"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ModeToggle } from "@/components/theme-provider";
import { UserButton, useUser } from "@stackframe/stack";
import { toast } from "sonner";
import { Logo } from "@/components/logo";

export default function PricingPage() {
  const router = useRouter();
  const user = useUser();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (plan: "free" | "pro") => {
    if (plan === "free") {
      // Free plan - just redirect to home
      router.push("/");
      return;
    }

    if (!user) {
      router.push("/handler/login");
      return;
    }

    setLoading(plan);
    try {
      // Create Razorpay order
      const response = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: "pro",
          amount: 85900, // 859 RS in paise
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      const { orderId, amount, currency } = await response.json();

      // Get Razorpay key from server
      const keyResponse = await fetch("/api/payments/get-key");
      const { keyId } = await keyResponse.json();

      if (!keyId) {
        throw new Error("Razorpay key not configured");
      }

      // Load Razorpay script
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        const options = {
          key: keyId,
          amount: amount,
          currency: currency,
          name: "Codebounce AI",
          description: "Pro Plan - Monthly Subscription",
          order_id: orderId,
          handler: async function (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) {
            // Verify payment on server
            const verifyResponse = await fetch("/api/payments/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (verifyResponse.ok) {
              toast.success("Payment successful! Welcome to Pro plan.");
              router.push("/");
            } else {
              toast.error("Payment verification failed");
            }
          },
          prefill: {
            email: user?.primaryEmail || "",
            name: user?.displayName || "",
          },
          theme: {
            color: "#000000",
          },
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
        setLoading(null);
      };
      document.body.appendChild(script);
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to initiate payment");
      setLoading(null);
    }
  };

  const plans = [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      description: "Perfect for trying out Codebounce AI",
      features: [
        { text: "1 prompt only", included: true },
        { text: "1 project only", included: true },
        { text: "300 lines of code total", included: true },
        { text: "Git integration", included: false },
        { text: "Unlimited projects", included: false },
        { text: "Custom domains", included: false },
        { text: "Priority in code edits and queueing", included: false },
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Pro",
      price: "₹859",
      period: "month",
      description: "For serious developers",
      features: [
        { text: "Unlimited prompts", included: true },
        { text: "Unlimited projects", included: true },
        { text: "Unlimited lines of code", included: true },
        { text: "Git integration", included: true },
        { text: "Custom domains", included: true },
        { text: "Priority in code edits and queueing", included: true },
        { text: "Advanced features", included: true },
      ],
      cta: "Subscribe Now",
      popular: true,
    },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border px-0 py-0">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Logo 
            width={120} 
            height={120}
            onClick={() => router.push("/")}
          />
          <div className="flex items-center gap-3">
            <ModeToggle />
            {user ? (
              <UserButton />
            ) : (
              <>
                <Button
                  variant="outline"
                  className="rounded-lg border-border bg-primary text-primary-foreground px-6 py-2 text-sm font-normal transition-all duration-200 hover:bg-primary/90 hover:scale-105"
                  onClick={() => router.push("/handler/login")}
                >
                  Log In
                </Button>
                <Button
                  variant="outline"
                  className="rounded-lg border-border bg-secondary text-secondary-foreground px-6 py-2 text-sm font-normal transition-all duration-200 hover:bg-secondary/80 hover:scale-105"
                  onClick={() => router.push("/handler/signup")}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Pricing Content */}
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-16 text-center">
          <h1 className="mb-4 font-pixelated text-5xl text-foreground sm:text-6xl md:text-7xl logo-shadow-main">
            Choose Your Plan
          </h1>
          <p className="text-lg text-muted-foreground">
            Start building amazing apps with Codebounce AI
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:max-w-5xl lg:mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative border-border bg-card backdrop-blur-sm transition-all duration-300 hover:border-border hover:shadow-lg ${
                plan.popular
                  ? "border-2 border-primary scale-105 md:scale-110"
                  : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary text-primary-foreground px-4 py-1 text-xs font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-card-foreground">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-card-foreground">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="ml-2 text-muted-foreground">/{plan.period}</span>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
                      ) : (
                        <X className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-500" />
                      )}
                      <span
                        className={`text-sm ${
                          feature.included
                            ? "text-card-foreground"
                            : "text-muted-foreground line-through"
                        }`}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  onClick={() => handleSubscribe(plan.name.toLowerCase() as "free" | "pro")}
                  disabled={loading === plan.name.toLowerCase()}
                  className={`w-full rounded-lg border transition-all duration-200 ${
                    plan.popular
                      ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105"
                      : "border-border bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-105"
                  }`}
                >
                  {loading === plan.name.toLowerCase()
                    ? "Processing..."
                    : plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="mb-8 text-center text-3xl font-bold text-foreground">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                Can I switch plans later?
              </h3>
              <p className="text-muted-foreground">
                Yes! You can upgrade or downgrade your plan at any time. Changes
                will be reflected in your next billing cycle.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                What payment methods do you accept?
              </h3>
              <p className="text-muted-foreground">
                We accept all major credit cards, debit cards, UPI, net banking,
                and wallets through Razorpay.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                Is there a refund policy?
              </h3>
              <p className="text-muted-foreground">
                We offer a 7-day money-back guarantee. If you're not satisfied,
                contact us for a full refund.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

