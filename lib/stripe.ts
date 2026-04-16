import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-03-25.dahlia',
  typescript: true,
});

// Plan definitions — single source of truth
export const PLANS = {
  plan_only: {
    name: 'Plan Only',
    nameAr: 'الخطة فقط',
    priceId: process.env.STRIPE_PRICE_PLAN_ONLY!,
    price: 149,
    currency: 'AED',
  },
  full_coaching: {
    name: 'Full Coaching',
    nameAr: 'التدريب الكامل',
    priceId: process.env.STRIPE_PRICE_FULL_COACHING!,
    price: 349,
    currency: 'AED',
  },
  elite: {
    name: 'Elite',
    nameAr: 'النخبة',
    priceId: process.env.STRIPE_PRICE_ELITE!,
    price: 549,
    currency: 'AED',
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export function getPlanByPriceId(priceId: string): PlanKey | null {
  for (const [key, plan] of Object.entries(PLANS)) {
    if (plan.priceId === priceId) return key as PlanKey;
  }
  return null;
}
