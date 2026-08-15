import { z } from "zod";

export const BUSINESS_TYPES = [
  "Independent brand",
  "Multi-brand retailer",
  "E-commerce only",
  "Wholesale / B2B",
  "Other",
] as const;

export const TEAM_SIZES = [
  "Just me",
  "2-5",
  "6-20",
  "21-50",
  "50+",
] as const;

export const CURRENCIES = ["USD", "GBP", "EUR", "CAD", "AUD"] as const;

export const onboardingSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  businessType: z.enum(BUSINESS_TYPES, {
    message: "Select a business type",
  }),
  country: z.string().min(1, "Country is required"),
  currency: z.enum(CURRENCIES, { message: "Select a currency" }),
  teamSize: z.enum(TEAM_SIZES, { message: "Select a team size" }),
});
export type OnboardingInput = z.infer<typeof onboardingSchema>;
