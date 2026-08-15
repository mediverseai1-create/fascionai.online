"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { NavLinks } from "@/components/dashboard/NavLinks";
import { SignOutButton } from "@/components/dashboard/SignOutButton";
import { PlanBadge } from "@/components/dashboard/PlanBadge";
import type { Plan } from "@/lib/supabase/types";

export function DashboardShell({
  organizationName,
  plan,
  userEmail,
  children,
}: {
  organizationName: string;
  plan: Plan;
  userEmail: string | null;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-paper">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-[240px] md:flex-col border-r border-line px-4 py-6 shrink-0">
        <SidebarContent
          organizationName={organizationName}
          plan={plan}
          userEmail={userEmail}
        />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-[260px] bg-paper border-r border-line px-4 py-6 overflow-y-auto">
            <SidebarContent
              organizationName={organizationName}
              plan={plan}
              userEmail={userEmail}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between border-b border-line px-4 py-3">
          <Link href="/dashboard" className="font-serif text-lg font-semibold">
            Facsion<span className="text-brass"> AI</span>
          </Link>
          <button
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
            className="p-2"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </header>
        <main className="flex-1 px-5 py-7 sm:px-8 sm:py-9 max-w-[1180px] w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarContent({
  organizationName,
  plan,
  userEmail,
  onNavigate,
}: {
  organizationName: string;
  plan: Plan;
  userEmail: string | null;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <Link
        href="/dashboard"
        className="font-serif text-lg font-semibold mb-1 px-1"
      >
        Facsion<span className="text-brass"> AI</span>
      </Link>
      <div className="px-1 mb-6">
        <p className="text-[13.5px] font-semibold truncate">
          {organizationName}
        </p>
        <PlanBadge plan={plan} className="mt-1.5" />
      </div>
      <NavLinks onNavigate={onNavigate} />
      <div className="mt-auto pt-6 px-1">
        <Link
          href="/dashboard/settings"
          className="block text-[14px] font-medium text-ink hover:text-wine mb-3"
          onClick={onNavigate}
        >
          Settings
        </Link>
        {userEmail && (
          <p className="text-[12.5px] text-muted truncate mb-2">
            {userEmail}
          </p>
        )}
        <SignOutButton />
      </div>
    </div>
  );
}
