"use client"

import { Plus, Trash2 } from "lucide-react"

import { numberInputProps } from "@/components/application-wizard/form-field"
import { EMPTY_LEASE_ITEM, type CardProps, type LeaseItem } from "@/components/application-wizard/wizard-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const NUMBER = numberInputProps("decimal")

const COLUMNS: Array<{ key: Exclude<keyof LeaseItem, "currency">; label: string; numeric?: boolean }> = [
  { key: "address", label: "მისამართი" },
  { key: "duration", label: "ხანგრძლივობა" },
  { key: "amount", label: "თანხა (GEL)", numeric: true },
  { key: "cadastral", label: "საკადასტრო კოდი" },
]

// "საიჯარო შემოსავლები": one row per leased property (max 20 on the backend).
export function LeaseItems({ form, errors, set }: CardProps) {
  const items = form.lease_income_items
  const update = (index: number, patch: Partial<LeaseItem>) =>
    set("lease_income_items", items.map((item, i) => (i === index ? { ...item, ...patch } : item)))

  return (
    <div className="flex flex-col gap-3 sm:col-span-2">
      <div className="flex items-center justify-between gap-3">
        <Label>საიჯარო შემოსავლები</Label>
        <Button type="button" variant="outline" className="h-10" onClick={() => set("lease_income_items", [...items, { ...EMPTY_LEASE_ITEM }])} disabled={items.length >= 20}>
          <Plus className="size-4" />
          დამატება
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">საიჯარო ობიექტები არ არის დამატებული</p>
      ) : (
        items.map((item, index) => (
          <div key={index} className="grid grid-cols-1 gap-3 rounded-lg border bg-muted/40 p-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] lg:items-end">
            {COLUMNS.map(({ key, label, numeric }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <Label htmlFor={`lease-${index}-${key}`} className="text-xs">{label}</Label>
                <Input
                  id={`lease-${index}-${key}`}
                  value={item[key]}
                  onChange={(event) => update(index, { [key]: event.target.value })}
                  {...(numeric ? NUMBER : {})}
                  className={cn("h-10 bg-card", numeric && NUMBER.className)}
                />
              </div>
            ))}
            <Button type="button" variant="ghost" size="icon" className="size-10 text-destructive hover:text-destructive" aria-label="წაშლა"
              onClick={() => set("lease_income_items", items.filter((_, i) => i !== index))}>
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))
      )}
      {errors.lease_income_items ? <p className="text-xs text-destructive">{errors.lease_income_items}</p> : null}
    </div>
  )
}
