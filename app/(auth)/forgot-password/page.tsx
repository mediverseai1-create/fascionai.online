"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import { createClient } from "@/lib/supabase/client";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations/auth";

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordInput) {
    setServerError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setServerError(error.message);
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <AuthShell title="Check your inbox">
        <FormAlert variant="success">
          If an account exists for that email, we&apos;ve sent a link to
          reset your password.
        </FormAlert>
        <Link href="/login" className="text-sm text-wine font-semibold">
          Back to log in
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll email you a link to set a new one."
      footer={
        <Link href="/login" className="text-wine font-semibold">
          Back to log in
        </Link>
      }
    >
      {serverError && <FormAlert variant="error">{serverError}</FormAlert>}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="Work email"
          type="email"
          placeholder="you@yourbrand.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <Button
          type="submit"
          className="w-full mt-1.5"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending…" : "Send reset link"}
        </Button>
      </form>
    </AuthShell>
  );
}
