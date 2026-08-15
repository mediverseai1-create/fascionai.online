"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import { createClient } from "@/lib/supabase/client";
import { profileSchema, type ProfileInput } from "@/lib/validations/settings";

export function ProfileForm({
  userId,
  fullName,
  email,
}: {
  userId: string;
  fullName: string | null;
  email: string | null;
}) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: fullName ?? "" },
  });

  async function onSubmit(data: ProfileInput) {
    setStatus("idle");
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: data.fullName })
      .eq("id", userId);

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }
    setStatus("success");
    setMessage("Profile updated.");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {status !== "idle" && (
        <FormAlert variant={status === "success" ? "success" : "error"}>
          {message}
        </FormAlert>
      )}
      <Input label="Full name" error={errors.fullName?.message} {...register("fullName")} />
      <Input label="Email" value={email ?? ""} disabled />
      <Button type="submit" size="sm" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
