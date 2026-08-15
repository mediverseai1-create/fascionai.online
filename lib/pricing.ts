import type { Plan } from "@/lib/supabase/types";

export interface PricingPlan {
  id: Plan;
  name: string;
  price: string;
  priceDetail: string;
  description: string;
  features: string[];
  paymentLinkEnvVar: "STARTER_PAYMENT_LINK" | "PRO_PAYMENT_LINK" | "SCALE_PAYMENT_LINK" | null;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    priceDetail: "/month",
    description: "Explore the dashboard with a single CSV upload.",
    features: [
      "Up to 100 SKUs",
      "Manual CSV upload",
      "Best & slow movers view",
      "Weekly refresh",
    ],
    paymentLinkEnvVar: null,
  },
  {
    id: "starter",
    name: "Starter",
    price: "$47",
    priceDetail: "/month",
    description: "For a single brand or retailer managing one active catalogue.",
    features: [
      "Up to 2,500 SKUs",
      "Stockout & overstock alerts",
      "Reorder recommendations",
      "Weekly CSV refresh",
    ],
    paymentLinkEnvVar: "STARTER_PAYMENT_LINK",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$57",
    priceDetail: "/month",
    description: "For growing teams that need trend and opportunity tracking.",
    features: [
      "Up to 10,000 SKUs",
      "Trends & opportunities",
      "AI-assisted insights",
      "Priority support",
    ],
    paymentLinkEnvVar: "PRO_PAYMENT_LINK",
  },
  {
    id: "scale",
    name: "Scale",
    price: "$97",
    priceDetail: "/month",
    description: "For multi-brand portfolios or teams needing enterprise controls.",
    features: [
      "Unlimited SKUs",
      "Multi-brand & multi-region",
      "Full report exports",
      "Dedicated support",
    ],
    paymentLinkEnvVar: "SCALE_PAYMENT_LINK",
  },
];

export function getPaymentLink(plan: PricingPlan): string | null {
  if (!plan.paymentLinkEnvVar) return null;
  const value = process.env[plan.paymentLinkEnvVar];
  return value && value.trim().length > 0 ? value : null;
}
