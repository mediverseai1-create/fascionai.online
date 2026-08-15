"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import { createClient } from "@/lib/supabase/client";
import {
  onboardingSchema,
  type OnboardingInput,
  BUSINESS_TYPES,
  TEAM_SIZES,
  CURRENCIES,
} from "@/lib/validations/onboarding";

export default function OnboardingPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { currency: "USD" },
  });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      const { data: membership } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (membership) {
        router.replace("/dashboard");
        return;
      }
      setCheckingExisting(false);
    });
  }, [router]);

  async function onSubmit(data: OnboardingInput) {
    setServerError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .insert({
        name: data.businessName,
        business_type: data.businessType,
        country: data.country,
        currency: data.currency,
        team_size: data.teamSize,
        created_by: user.id,
      })
      .select()
      .single();

    if (orgError || !org) {
      setServerError(orgError?.message ?? "Couldn't create your workspace.");
      return;
    }

    const { error: memberError } = await supabase
      .from("organization_members")
      .insert({
        organization_id: org.id,
        user_id: user.id,
        role: "owner",
      });

    if (memberError) {
      setServerError(memberError.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  if (checkingExisting) {
    return (
      <AuthShell title="Setting things up…">
        <p className="text-sm text-muted">One moment.</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Tell us about your business"
      subtitle="This sets up your FACSION AI workspace — takes under a minute."
    >
      {serverError && <FormAlert variant="error">{serverError}</FormAlert>}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="Business or brand name"
          type="text"
          placeholder="Your brand or store name"
          error={errors.businessName?.message}
          {...register("businessName")}
        />
        <Select
          label="Business type"
          error={errors.businessType?.message}
          defaultValue=""
          {...register("businessType")}
        >
          <option value="" disabled>
            Select one
          </option>
          {BUSINESS_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </Select>
        <Input
          label="Country"
          type="text"
          placeholder="United Kingdom"
          error={errors.country?.message}
          {...register("country")}
        />
        <Select
          label="Currency"
          error={errors.currency?.message}
          {...register("currency")}
        >
          {CURRENCIES.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </Select>
        <Select
          label="Team size"
          error={errors.teamSize?.message}
          defaultValue=""
          {...register("teamSize")}
        >
          <option value="" disabled>
            Select one
          </option>
          {TEAM_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </Select>
        <Button
          type="submit"
          className="w-full mt-1.5"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Setting up…" : "Continue to dashboard"}
        </Button>
      </form>
    </AuthShell>
  );
}
