import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"


const badgeVariants = cva(
  "inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full border border-transparent px-2.5 text-xs font-semibold whitespace-nowrap transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        outline: "border-border text-foreground",
        draft: "bg-[color-mix(in_oklch,var(--status-draft)_16%,var(--card))] text-status-draft",
        submitted: "bg-[color-mix(in_oklch,var(--status-submitted)_16%,var(--card))] text-status-submitted",
        approved: "bg-[color-mix(in_oklch,var(--status-approved)_16%,var(--card))] text-status-approved",
        rejected: "bg-[color-mix(in_oklch,var(--status-rejected)_16%,var(--card))] text-status-rejected",
        returned: "bg-[color-mix(in_oklch,var(--status-returned)_20%,var(--card))] text-[var(--status-returned-text)]",
        success: "bg-[color-mix(in_oklch,var(--success)_16%,var(--card))] text-success",
        warning: "bg-[color-mix(in_oklch,var(--warning)_18%,var(--card))] text-[color-mix(in_oklch,var(--warning)_65%,black)] dark:text-warning",
        info: "bg-[color-mix(in_oklch,var(--info)_16%,var(--card))] text-info",
        destructive: "bg-[color-mix(in_oklch,var(--destructive)_16%,var(--card))] text-destructive",
        inactive: "bg-[color-mix(in_oklch,var(--status-draft)_16%,var(--card))] text-status-draft",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}

// The dot that goes before the label, so status is never told by color alone.
function BadgeDot({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("size-1.5 shrink-0 rounded-full bg-current", className)} />
}

export { Badge, BadgeDot, badgeVariants }
