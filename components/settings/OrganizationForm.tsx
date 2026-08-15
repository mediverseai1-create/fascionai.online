"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import { createClient } from "@/lib/supabase/client";
import {
  organizationSchema,
  type OrganizationInput,
} from "@/lib/validations/settings";
import {
  BUSINESS_TYPES,
  TEAM_SIZES,
  CURRENCIES,
} from "@/lib/validations/onboarding";

export function OrganizationForm({
  organizationId,
  canEdit,
  defaults,
}: {
  organizationId: string;
  canEdit: boolean;
  defaults: OrganizationInput;
}) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OrganizationInput>({
    resolver: zodResolver(organizationSchema),
    defaultValues: defaults,
  });

  async function onSubmit(data: OrganizationInput) {
    setStatus("idle");
    const supabase = createClient();
    const { error } = await supabase
      .from("organizations")
      .update({
        name: data.name,
        business_type: data.businessType,
        country: data.country,
        currency: data.currency,
        team_size: data.teamSize,
      })
      .eq("id", organizationId);

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }
    setStatus("success");
    setMessage("Business details updated.");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {status !== "idle" && (
        <FormAlert variant={status === "success" ? "success" : "error"}>
          {message}
        </FormAlert>
      )}
      <Input
        label="Business name"
        disabled={!canEdit}
        error={errors.name?.message}
        {...register("name")}
      />
      <Select
        label="Business type"
        disabled={!canEdit}
        error={errors.businessType?.message}
        {...register("businessType")}
      >
        {BUSINESS_TYPES.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </Select>
      <Input
        label="Country"
        disabled={!canEdit}
        error={errors.country?.message}
        {...register("country")}
      />
      <Select
        label="Currency"
        disabled={!canEdit}
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
        disabled={!canEdit}
        error={errors.teamSize?.message}
        {...register("teamSize")}
      >
        {TEAM_SIZES.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </Select>
      {canEdit ? (
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save business details"}
        </Button>
      ) : (
        <p className="text-xs text-muted">
          Only the workspace owner can edit these details.
        </p>
      )}
    </form>
  );
}
