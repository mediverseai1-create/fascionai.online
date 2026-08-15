import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
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
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full px-[13px] py-[11px] border border-line rounded-[var(--radius)] font-sans text-sm bg-[#FBFAF7] outline-none focus:outline-2 focus:outline-wine focus:outline-offset-1",
            error && "border-risk",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-risk">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
