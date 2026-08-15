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
import { signupSchema, type SignupInput } from "@/lib/validations/auth";

export default function SignupPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });

  async function onSubmit(data: SignupInput) {
    setServerError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.fullName },
        emailRedirectTo: `${window.location.origin}/onboarding`,
      },
    });

    if (error) {
      setServerError(error.message);
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <AuthShell title="Check your inbox" subtitle="You're almost in.">
        <FormAlert variant="success">
          We&apos;ve sent a confirmation link to your email. Click it to
          verify your account, then you&apos;ll be taken to set up your
          workspace.
        </FormAlert>
        <Link href="/login" className="text-sm text-wine font-semibold">
          Back to log in
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Set up your workspace in under two minutes."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-wine font-semibold">
            Log in
          </Link>
        </>
      }
    >
      {serverError && <FormAlert variant="error">{serverError}</FormAlert>}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="Your name"
          type="text"
          placeholder="Jordan Rivera"
          error={errors.fullName?.message}
          {...register("fullName")}
        />
        <Input
          label="Work email"
          type="email"
          placeholder="you@yourbrand.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          error={errors.password?.message}
          {...register("password")}
        />
        <Button
          type="submit"
          className="w-full mt-1.5"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating account…" : "Create free account"}
        </Button>
      </form>
    </AuthShell>
  );
}
