import { AlertTriangle, Clock, X } from "lucide-react"

import { ATTENTION, ATTENTION_TONE, isAttentionKey } from "@/lib/application-attention"
import { cn } from "@/lib/utils"

// The active "ყურადღება!" category, as on the dashboard; ✕ removes it (back to the default filters).
export function AttentionChip({ value, onClear }: { value: string; onClear: () => void }) {
  if (!isAttentionKey(value)) return null
  const { label, tone } = ATTENTION[value]

  return (
    <div className={cn("flex w-full items-center gap-2.5 rounded-lg border py-1.5 pr-1.5 pl-2.5 sm:w-fit", ATTENTION_TONE[tone].row)}>
      <span className={cn("flex size-7 flex-none items-center justify-center rounded-md", ATTENTION_TONE[tone].icon)} aria-hidden="true">
        {tone === "d" ? <Clock className="size-3.5" strokeWidth={2.2} /> : <AlertTriangle className="size-3.5" strokeWidth={2.2} />}
      </span>
      <span className="flex-1 text-[13px] font-semibold"><span className="font-normal text-muted-foreground">ფილტრი: </span>{label}</span>
      <button type="button" onClick={onClear} aria-label="ფილტრის მოხსნა" title="ფილტრის მოხსნა"
        className="flex size-8 flex-none items-center justify-center rounded-md text-muted-foreground hover:bg-background/60 hover:text-foreground">
        <X className="size-4" />
      </button>
    </div>
  )
}
