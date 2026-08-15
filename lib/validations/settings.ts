import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().min(1, "Your name is required"),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const organizationSchema = z.object({
  name: z.string().min(1, "Business name is required"),
  businessType: z.string().min(1, "Business type is required"),
  country: z.string().min(1, "Country is required"),
  currency: z.string().min(1, "Currency is required"),
  teamSize: z.string().min(1, "Team size is required"),
});
export type OrganizationInput = z.infer<typeof organizationSchema>;
