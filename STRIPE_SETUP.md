# Stripe Integration Setup Guide

This guide will help you set up Stripe for subscription management in your application.

## What Has Been Added

1. **Stripe Packages**: `@stripe/stripe-js` and `stripe` npm packages
2. **Settings Page**: `/settings` route displaying user email and subscription info
3. **Stripe Configuration**: `lib/stripe.ts` with helper functions
4. **Environment Variables**: `.env.local.example` template

## Setup Steps

### 1. Install Dependencies (if not already done)

```bash
npm install @stripe/stripe-js stripe
```

### 2. Create a Stripe Account

1. Go to [https://stripe.com](https://stripe.com) and create an account
2. Access your Dashboard at [https://dashboard.stripe.com](https://dashboard.stripe.com)

### 3. Get Your API Keys

1. In your Stripe Dashboard, go to **Developers** → **API keys**
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)

### 4. Set Up Environment Variables

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
```

### 5. Create Products and Prices in Stripe

1. In Stripe Dashboard, go to **Products**
2. Click **Add Product**
3. Create a "Premium Subscription" product
4. Add pricing (e.g., $9.99/month)
5. Copy the **Price ID** (starts with `price_`)
6. Update `lib/stripe.ts` with your actual Price IDs

### 6. Current Features

The settings page currently displays:
- User's email address (from Firebase Auth)
- User ID
- Current subscription tier (free/premium)
- Subscription status

### 7. Next Steps for Full Integration

To complete the Stripe integration, you'll need to:

1. **Create Checkout Session API Route**
   - Create `/app/api/checkout/route.ts`
   - Handle creation of Stripe Checkout sessions

2. **Set Up Webhooks**
   - Configure webhook endpoint in Stripe Dashboard
   - Create `/app/api/webhooks/stripe/route.ts`
   - Handle events like `checkout.session.completed`, `customer.subscription.updated`

3. **Store Subscription Data**
   - Store Stripe customer ID in Firebase
   - Store subscription info in Firestore
   - Update user's subscription status on webhook events

4. **Update Settings Page**
   - Fetch real subscription data from Firestore
   - Add "Manage Subscription" functionality
   - Integrate Stripe Customer Portal

## Testing

Use Stripe's test card numbers:
- **Success**: `4242 4242 4242 4242`
- **Requires authentication**: `4000 0025 0000 3155`
- Use any future expiry date and any 3-digit CVC

## Files Created

- `/app/settings/page.tsx` - Settings page route
- `/components/SettingsContent.tsx` - Settings page client component
- `/lib/stripe.ts` - Stripe configuration and helpers
- `.env.local.example` - Environment variables template
- `STRIPE_SETUP.md` - This setup guide

## Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe + Next.js Guide](https://stripe.com/docs/payments/checkout/how-checkout-works)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
