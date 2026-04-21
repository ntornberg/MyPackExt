"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";
import * as React from "react";

import { cn } from "@/lib/utils";

const toggleGroupVariants = cva("group/toggle-group inline-flex items-center", {
  variants: {
    variant: {
      default: "rounded-lg bg-muted p-1 text-muted-foreground",
      outline: "gap-1 rounded-lg text-muted-foreground",
    },
    size: {
      default: "min-h-8",
      sm: "min-h-7",
      lg: "min-h-9",
    },
    spacing: {
      0: "gap-0",
      1: "gap-1",
      2: "gap-2",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
    spacing: 0,
  },
});

const toggleGroupItemVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-1 rounded-md border border-transparent font-medium whitespace-nowrap transition-all outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=on]:shadow-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-transparent text-foreground/70 hover:text-foreground data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:border-border/60 dark:data-[state=on]:bg-muted dark:data-[state=on]:border-border",
        outline:
          "border-border bg-background text-foreground/70 hover:bg-muted hover:text-foreground data-[state=on]:border-primary/45 data-[state=on]:bg-primary/10 data-[state=on]:text-foreground dark:bg-input/30 dark:hover:bg-input/50 dark:data-[state=on]:bg-primary/15 dark:data-[state=on]:border-primary/50",
      },
      size: {
        default: "h-8 px-2.5 text-sm",
        sm: "h-7 px-2.5 text-[0.8rem]",
        lg: "h-9 px-3 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function ToggleGroup({
  className,
  variant,
  size,
  spacing,
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleGroupVariants>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      className={cn(toggleGroupVariants({ variant, size, spacing }), className)}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Root>
  );
}

function ToggleGroupItem({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleGroupItemVariants>) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={variant}
      data-size={size}
      className={cn(toggleGroupItemVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { ToggleGroup, ToggleGroupItem };
