"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS: Array<{ href: string; label: string; exact?: boolean }> = [
  { href: "/dashboard", label: "Overview", exact: true },
  { href: "/dashboard/attention", label: "Attention needed" },
  { href: "/dashboard/products", label: "Products" },
  { href: "/dashboard/sales", label: "Sales & revenue" },
  { href: "/dashboard/trends", label: "Trends" },
  { href: "/dashboard/opportunities", label: "Opportunities" },
  { href: "/dashboard/reports", label: "Reports" },
  { href: "/dashboard/import", label: "Import data" },
];

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5">
      {NAV_ITEMS.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "px-3.5 py-2.5 rounded-[var(--radius)] text-[14px] font-medium transition-colors",
              active
                ? "bg-wine text-white"
                : "text-ink hover:bg-brass-soft/60"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
