"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type SwitchProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> & {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, className, disabled, onCheckedChange, type = "button", ...props }, ref) => (
    <button
      aria-checked={checked}
      className={cn(
        "peer inline-flex h-7 w-12 shrink-0 items-center rounded-full border border-transparent bg-slate-300/90 p-0.5 transition-[background-color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-teal-600 dark:bg-white/15 dark:focus-visible:ring-offset-slate-950 dark:data-[state=checked]:bg-teal-500",
        className,
      )}
      data-state={checked ? "checked" : "unchecked"}
      disabled={disabled}
      onClick={() => {
        if (!disabled) {
          onCheckedChange?.(!checked);
        }
      }}
      ref={ref}
      role="switch"
      type={type}
      {...props}
    >
      <span
        className={cn(
          "pointer-events-none block size-6 rounded-full bg-white shadow-[0_4px_12px_rgba(15,23,42,0.22)] transition-transform dark:bg-slate-950",
          checked ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  ),
);

Switch.displayName = "Switch";

export { Switch };
