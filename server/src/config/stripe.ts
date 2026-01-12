import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

export const PLANS = {
  monthly: {
    id: 'monthly',
    name: 'Monthly',
    price: 9.99,
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID!,
    interval: 'month' as const,
  },
  yearly: {
    id: 'yearly',
    name: 'Yearly',
    price: 99.99,
    priceId: process.env.STRIPE_YEARLY_PRICE_ID!,
    interval: 'year' as const,
  },
};
