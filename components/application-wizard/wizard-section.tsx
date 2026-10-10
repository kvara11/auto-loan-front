import { type ReactNode } from "react"

import { cn } from "@/lib/utils"

type WizardSectionProps = { title: string; description?: string; action?: ReactNode; className?: string; children: ReactNode }

// A wizard card (design: 22px padding, 17px title) with a two-column field grid from sm.
export function WizardSection({ title, description, action, className, children }: WizardSectionProps) {
  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm sm:p-[22px]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[17px] font-semibold">{title}</h2>
          {description ? <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className={cn("grid grid-cols-1 gap-[18px] sm:grid-cols-2", className)}>{children}</div>
    </section>
  )
}
