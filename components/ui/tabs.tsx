import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-auto w-full items-center rounded-[22px] bg-slate-100/90 p-1.5 text-slate-500 dark:bg-white/10 dark:text-slate-400",
      className,
    )}
    {...props}
  />
));

TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex flex-1 items-center justify-center rounded-[18px] px-3 py-2.5 text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-[0_12px_30px_-24px_rgba(15,23,42,0.95)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/70 dark:data-[state=active]:bg-slate-950 dark:data-[state=active]:text-slate-50 dark:data-[state=active]:shadow-[0_12px_30px_-24px_rgba(2,6,23,0.95)]",
      className,
    )}
    {...props}
  />
));

TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn("mt-4 outline-none", className)}
    {...props}
  />
));

TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsContent, TabsList, TabsTrigger };
