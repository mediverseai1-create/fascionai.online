"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    setServerError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setServerError(
        error.message === "Invalid login credentials"
          ? "Incorrect email or password."
          : error.message
      );
      return;
    }

    const redirectTo = searchParams.get("redirectTo") || "/dashboard";
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <AuthShell
      title="Log in"
      subtitle="Welcome back — pick up where you left off."
      footer={
        <>
          New here?{" "}
          <Link href="/signup" className="text-wine font-semibold">
            Sign up
          </Link>
        </>
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
        <Input
          label="Password"
          type="password"
          placeholder="Your password"
          error={errors.password?.message}
          {...register("password")}
        />
        <div className="flex justify-end -mt-2 mb-4">
          <Link
            href="/forgot-password"
            className="text-[13px] text-muted hover:text-wine"
          >
            Forgot password?
          </Link>
        </div>
        <Button
          type="submit"
          className="w-full mt-1.5"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Logging in…" : "Log in"}
        </Button>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
