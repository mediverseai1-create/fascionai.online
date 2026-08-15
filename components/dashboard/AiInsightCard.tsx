"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";

export function AiInsightCard() {
  const [state, setState] = useState<
    | { status: "idle" }
    | { status: "loading" }
    | { status: "unavailable"; message: string }
    | { status: "ready"; insight: string | null; message?: string }
    | { status: "error"; message: string }
  >({ status: "idle" });

  async function generate() {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/ai/insights", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setState({ status: "error", message: json.error ?? "Something went wrong." });
        return;
      }
      if (!json.available) {
        setState({ status: "unavailable", message: json.message });
        return;
      }
      setState({ status: "ready", insight: json.insight, message: json.message });
    } catch {
      setState({ status: "error", message: "Could not reach the server." });
    }
  }

  return (
    <Card className="p-6">
      <Eyebrow>AI insights</Eyebrow>
      {state.status === "idle" && (
        <>
          <p className="text-sm text-muted mb-4">
            Get a plain-language weekly briefing generated from your actual
            revenue, product, and stock data.
          </p>
          <Button size="sm" onClick={generate}>
            Generate this week&apos;s briefing
          </Button>
        </>
      )}
      {state.status === "loading" && (
        <p className="text-sm text-muted py-2">Analyzing your data…</p>
      )}
      {state.status === "unavailable" && (
        <p className="text-sm text-muted py-2">{state.message}</p>
      )}
      {state.status === "error" && (
        <p className="text-sm text-risk py-2">{state.message}</p>
      )}
      {state.status === "ready" && (
        <p className="text-sm leading-relaxed py-1">
          {state.insight ?? state.message ?? "No insight available right now."}
        </p>
      )}
    </Card>
  );
}
