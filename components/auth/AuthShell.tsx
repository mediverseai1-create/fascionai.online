import { Logo } from "@/components/marketing/Logo";
import type { ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <div className="py-8 flex justify-center">
        <Logo />
      </div>
      <div className="flex-1 flex items-start justify-center px-5 pb-16">
        <div className="w-full max-w-[440px] bg-card border border-line rounded-[var(--radius)] p-8 sm:p-9">
          <h1 className="font-serif text-[22px] mb-1.5">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted mb-6">{subtitle}</p>
          )}
          {children}
          {footer && (
            <div className="mt-5 text-center text-[13px] text-muted">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
