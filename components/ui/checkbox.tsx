"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Checkbox({ className, ...props }: React.ComponentProps<"input">) {
    return (
        <input
            type="checkbox"
            data-slot="checkbox"
            className={cn(
                "peer size-4 shrink-0 rounded-sm border border-input bg-background shadow-sm outline-none transition-shadow focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 accent-foreground",
                className
            )}
            {...props}
        />
    )
}

export { Checkbox }