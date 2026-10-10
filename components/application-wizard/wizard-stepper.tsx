import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const STEPS = ["კლიენტი", "სესხი და ავტომობილი"]

export function WizardStepper({ step }: { step: 1 | 2 }) {
  return (
    <ol className="flex max-w-[480px] items-center gap-3" aria-label="ნაბიჯები">
      {STEPS.map((label, index) => {
        const number = index + 1
        const done = number < step
        const active = number <= step

        return (
          <li key={label} className={cn("flex items-center gap-3", index > 0 && "flex-1")}>
            {index > 0 ? <span aria-hidden="true" className={cn("h-0.5 flex-1", active ? "bg-primary" : "bg-border")} /> : null}
            <span
              aria-current={number === step ? "step" : undefined}
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full text-[13px] font-bold",
                active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              {done ? <Check className="size-4" /> : number}
            </span>
            <span className={cn("text-sm font-semibold whitespace-nowrap", !active && "text-muted-foreground")}>{label}</span>
          </li>
        )
      })}
    </ol>
  )
}
