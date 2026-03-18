import type React from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-teal-700 text-white",
        secondary: "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200",
        outline: "border border-slate-200 bg-white/70 text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-slate-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type BadgeProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
