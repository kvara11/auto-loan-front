import { type ReactNode } from "react"
import { AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"

export function OverviewHead({ title, text, children }: { title: string; text: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="text-[19px] font-bold sm:text-[22px]">{title}</h2>
        <p className="mt-1 text-[13px] text-muted-foreground">{text}</p>
      </div>
      {children}
    </div>
  )
}

const time = (d?: Date) => (d ? `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}` : null)

// A failed refresh: the last data stays visible below the banner.
export function ErrorBanner({ hasData, updatedAt, message, onRetry }: { hasData: boolean; updatedAt?: Date; message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl border border-[color-mix(in_oklch,var(--destructive)_45%,var(--border))] bg-[color-mix(in_oklch,var(--destructive)_10%,var(--card))] px-4 py-3">
      <AlertTriangle className="size-5 flex-none text-destructive" aria-hidden="true" />
      <div className="min-w-0 flex-1 text-[13px]">
        <b className="block text-sm">{hasData ? "მონაცემების განახლება ვერ მოხერხდა" : "მონაცემების ჩატვირთვა ვერ მოხერხდა"}</b>
        {hasData && updatedAt ? `ნაჩვენებია ბოლო შენახული მდგომარეობა — დღეს, ${time(updatedAt)}. შეამოწმეთ კავშირი და სცადეთ თავიდან.` : message}
      </div>
      <Button variant="outline" size="sm" className="h-[34px]" onClick={onRetry}>თავიდან ცდა</Button>
    </div>
  )
}
