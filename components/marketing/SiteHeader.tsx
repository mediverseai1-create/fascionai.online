"use client";

import { useState } from "react";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "./Logo";

const NAV_LINKS = [
  { href: "#product", label: "Product" },
  { href: "#how", label: "How it works" },
  { href: "#security", label: "Security" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-paper/92 backdrop-blur-[8px] border-b border-line">
      <div className="wrap flex items-center justify-between py-4 relative">
        <Logo />
        <nav className="hidden md:flex items-center gap-[34px]">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[14.5px] font-medium text-ink hover:text-wine"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <ButtonLink href="/login" variant="ghost" size="sm" className="hidden md:inline-flex">
            Log in
          </ButtonLink>
          <ButtonLink href="/signup" variant="primary" size="sm" className="hidden md:inline-flex">
            Sign up
          </ButtonLink>
          <button
            className="md:hidden flex bg-transparent border-none p-1.5 text-ink"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-[22px] h-[22px]">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>

        {open && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-paper border-b border-line flex flex-col gap-[18px] px-8 py-5">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[14.5px] font-medium text-ink hover:text-wine"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="flex items-center gap-3 pt-2">
              <Link
                href="/login"
                className="text-[14.5px] font-semibold text-ink"
                onClick={() => setOpen(false)}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="text-[14.5px] font-semibold text-wine"
                onClick={() => setOpen(false)}
              >
                Sign up
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
