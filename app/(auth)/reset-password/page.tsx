"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import { createClient } from "@/lib/supabase/client";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validations/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState<boolean | null>(null);
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    const supabase = createClient();
    // The password-recovery email link establishes a session in this
    // browser tab automatically (Supabase detects the code in the URL).
    supabase.auth.getSession().then(({ data }) => {
      setSessionReady(!!data.session);
    });
  }, []);

  async function onSubmit(data: ResetPasswordInput) {
    setServerError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      setServerError(error.message);
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/dashboard"), 1500);
  }

  if (sessionReady === false) {
    return (
      <AuthShell title="Link expired">
        <FormAlert variant="error">
          This password reset link is invalid or has expired. Request a new
          one from the login page.
        </FormAlert>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell title="Password updated">
        <FormAlert variant="success">
          Your password has been changed. Taking you to your dashboard…
        </FormAlert>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose something you haven't used before."
    >
      {serverError && <FormAlert variant="error">{serverError}</FormAlert>}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="New password"
          type="password"
          placeholder="At least 8 characters"
          error={errors.password?.message}
          {...register("password")}
        />
        <Input
          label="Confirm password"
          type="password"
          placeholder="Re-enter your password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        <Button
          type="submit"
          className="w-full mt-1.5"
          disabled={isSubmitting || sessionReady === null}
        >
          {isSubmitting ? "Updating…" : "Update password"}
        </Button>
      </form>
    </AuthShell>
  );
}
