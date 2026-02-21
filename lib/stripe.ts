import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    
    if (!publishableKey) {
      console.warn('Stripe publishable key is not configured');
      return null;
    }
    
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

// Subscription price IDs (you'll need to create these in your Stripe Dashboard)
export const STRIPE_PRICES = {
  PREMIUM_MONTHLY: 'price_1T3KVS2Fqdc8JbeKjgJZoGlL', // Replace with your actual Stripe Price ID
  PREMIUM_YEARLY: 'price_1T3KV72Fqdc8JbeK6RAhbcop',   // Replace with your actual Stripe Price ID
};

// Helper function to format price
export const formatPrice = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount / 100);
};
