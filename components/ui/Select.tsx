import { cn } from "@/lib/utils";
import { forwardRef, type SelectHTMLAttributes } from "react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => {
    return (
      <div className="mb-4">
        {label && (
          <label
            htmlFor={id}
            className="block text-[12.5px] font-semibold mb-[7px]"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={cn(
            "w-full px-[13px] py-[11px] border border-line rounded-[var(--radius)] font-sans text-sm bg-[#FBFAF7] outline-none focus:outline-2 focus:outline-wine focus:outline-offset-1",
            error && "border-risk",
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="mt-1.5 text-xs text-risk">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
