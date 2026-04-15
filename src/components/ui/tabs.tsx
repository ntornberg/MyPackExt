import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-horizontal:flex-col",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
        segmented:
          "flex h-auto w-full min-w-0 gap-1 rounded-xl border-2 border-border bg-background/40 p-1 shadow-sm group-data-horizontal/tabs:h-auto max-sm:flex-col max-sm:items-stretch dark:bg-white/[0.05]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-solid border-transparent px-1.5 py-0.5 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/35 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 dark:text-muted-foreground dark:hover:text-foreground group-data-[variant=default]/tabs-list:data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:shadow-none dark:group-data-[variant=line]/tabs-list:data-[state=active]:border-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent",
        "group-data-[variant=segmented]/tabs-list:min-h-10 group-data-[variant=segmented]/tabs-list:flex-1 group-data-[variant=segmented]/tabs-list:rounded-lg group-data-[variant=segmented]/tabs-list:border-2 group-data-[variant=segmented]/tabs-list:border-solid group-data-[variant=segmented]/tabs-list:bg-transparent group-data-[variant=segmented]/tabs-list:px-2 group-data-[variant=segmented]/tabs-list:py-2 group-data-[variant=segmented]/tabs-list:text-xs group-data-[variant=segmented]/tabs-list:font-semibold group-data-[variant=segmented]/tabs-list:sm:px-3 group-data-[variant=segmented]/tabs-list:sm:text-sm group-data-[variant=segmented]/tabs-list:data-[state=inactive]:border-transparent group-data-[variant=segmented]/tabs-list:data-[state=inactive]:bg-transparent group-data-[variant=segmented]/tabs-list:data-[state=inactive]:shadow-none group-data-[variant=segmented]/tabs-list:data-[state=inactive]:text-foreground/70 group-data-[variant=segmented]/tabs-list:data-[state=inactive]:hover:bg-foreground/[0.06] group-data-[variant=segmented]/tabs-list:data-[state=inactive]:hover:text-foreground dark:group-data-[variant=segmented]/tabs-list:data-[state=inactive]:text-foreground/80 dark:group-data-[variant=segmented]/tabs-list:data-[state=inactive]:hover:bg-white/[0.08] group-data-[variant=segmented]/tabs-list:data-[state=active]:border-primary/55 group-data-[variant=segmented]/tabs-list:data-[state=active]:bg-background group-data-[variant=segmented]/tabs-list:data-[state=active]:text-foreground group-data-[variant=segmented]/tabs-list:data-[state=active]:shadow-sm dark:group-data-[variant=segmented]/tabs-list:data-[state=active]:bg-card/95 dark:group-data-[variant=segmented]/tabs-list:data-[state=active]:text-foreground",
        "group-data-[variant=default]/tabs-list:data-[state=active]:bg-background group-data-[variant=default]/tabs-list:data-[state=active]:text-foreground group-data-[variant=default]/tabs-list:data-[state=active]:border-border/60 dark:group-data-[variant=default]/tabs-list:data-[state=active]:border-border dark:group-data-[variant=default]/tabs-list:data-[state=active]:bg-muted dark:group-data-[variant=default]/tabs-list:data-[state=active]:text-foreground",
        "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
