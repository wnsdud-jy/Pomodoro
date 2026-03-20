import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex touch-manipulation items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-[transform,box-shadow,background-color,color] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:translate-y-px dark:focus-visible:ring-offset-slate-950",
  {
    variants: {
      variant: {
        default:
          "bg-teal-700 text-white shadow-[0_12px_30px_-16px_rgba(15,118,110,0.45)] hover:bg-teal-600",
        secondary:
          "bg-white/80 text-slate-700 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.8)] ring-1 ring-slate-200 backdrop-blur hover:bg-white dark:bg-white/10 dark:text-slate-100 dark:ring-white/10 dark:hover:bg-white/15",
        outline:
          "border border-slate-300 bg-white/60 text-slate-700 hover:bg-slate-100/90 dark:border-white/15 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10",
        ghost:
          "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
