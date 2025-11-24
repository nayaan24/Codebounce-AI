# Razorpay Payment Integration Setup

This guide will help you set up Razorpay payment integration for the pricing page.

## Prerequisites

1. A Razorpay account - Sign up at [https://razorpay.com](https://razorpay.com)
2. Your Razorpay API keys

## Setup Steps

### 1. Get Your Razorpay API Keys

1. Log in to your [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Go to **Settings** → **API Keys**
3. Generate a new API key pair (or use existing ones)
4. Copy your **Key ID** and **Key Secret**

### 2. Configure Environment Variables

Add the following environment variables to your `.env` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here

# Optional: For client-side access (if needed)
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key_id_here

# Webhook Secret (get this from Razorpay Dashboard → Settings → Webhooks)
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

### 3. Set Up Webhooks (Optional but Recommended)

1. Go to **Razorpay Dashboard** → **Settings** → **Webhooks**
2. Add a new webhook with the URL: `https://yourdomain.com/api/payments/webhook`
3. Select the following events:
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
4. Copy the webhook secret and add it to your `.env` file

### 4. Test the Integration

1. Use Razorpay's test mode to test payments
2. Test cards are available in the Razorpay Dashboard
3. Navigate to `/pricing` on your app
4. Click "Subscribe Now" on the Pro plan
5. Complete a test payment

## API Routes

The integration includes the following API routes:

- **POST `/api/payments/create-order`** - Creates a Razorpay order
- **POST `/api/payments/verify`** - Verifies payment signature
- **GET `/api/payments/get-key`** - Returns Razorpay key ID (safe for client)
- **POST `/api/payments/webhook`** - Handles Razorpay webhook events

## Database Integration

Currently, the payment verification saves to a TODO comment. To fully integrate:

1. Create a `subscriptions` table in your database schema
2. Update the verification route to save subscription data
3. Update the webhook handler to manage subscription lifecycle

Example schema:

```typescript
export const subscriptionsTable = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  plan: text("plan").notNull(), // "free" | "pro"
  razorpayOrderId: text("razorpay_order_id").unique(),
  razorpayPaymentId: text("razorpay_payment_id").unique(),
  status: text("status").notNull(), // "active" | "cancelled" | "expired"
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
});
```

## Pricing

- **Free Plan**: ₹0 - 1 prompt, 1 project (300 lines max), no git, no custom domains
- **Pro Plan**: ₹859/month - Unlimited everything

## Security Notes

- Never expose `RAZORPAY_KEY_SECRET` on the client side
- Always verify payment signatures on the server
- Use HTTPS in production
- Validate webhook signatures before processing

## Support

For Razorpay-specific issues, refer to the [Razorpay Documentation](https://razorpay.com/docs/).

