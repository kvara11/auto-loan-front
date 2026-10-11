"use client"

import { Loader2, Search, UserCheck, UserX } from "lucide-react"

import { Field } from "@/components/application-wizard/form-field"
import { WizardSection } from "@/components/application-wizard/wizard-section"
import { type WizardState } from "@/components/application-wizard/use-application-wizard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn, PERSONAL_ID_WIDTH } from "@/lib/utils"

// "კლიენტის მოძიება": typing the 11th digit (or the search button) looks the client up.
export function ClientLookupCard({ wizard }: { wizard: WizardState }) {
  const { form, errors, set, client, lookup, resetClient, isEdit } = wizard
  const found = client.status === "existing"
  const locked = client.status !== "idle" || client.loading

  return (
    <WizardSection title="კლიენტის მოძიება" className="sm:grid-cols-1">
      <Field id="personal_id" label="პირადი ნომერი" required error={errors.personal_id}>
        <div className="flex gap-2">
          <Input
            id="personal_id"
            className={cn("h-10 tabular-nums", PERSONAL_ID_WIDTH)}
            value={form.personal_id}
            onChange={(event) => set("personal_id", event.target.value.replace(/\D/g, ""))}
            placeholder="11 ნიშნა ნომერი"
            maxLength={11}
            inputMode="numeric"
            readOnly={locked}
            aria-invalid={Boolean(errors.personal_id)}
          />
          {client.status === "idle" ? (
            <Button type="button" className="h-10" onClick={() => void lookup()} disabled={form.personal_id.length !== 11 || client.loading}>
              {client.loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
              ძებნა
            </Button>
          ) : null}
        </div>
      </Field>

      {found ? (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-success/30 bg-success/10 p-3.5">
          <span className="flex size-9 items-center justify-center rounded-full bg-success text-success-foreground">
            <UserCheck className="size-4" />
          </span>
          <div className="min-w-48 flex-1">
            <p className="text-sm font-semibold">
              {form.first_name} {form.last_name} — მოიძებნა
            </p>
            <p className="text-xs text-muted-foreground">მონაცემები შევსებულია ავტომატურად; ცვლილებები კლიენტის პროფილში შეინახება</p>
          </div>
          {isEdit ? null : (
            // Only takes the client off this form; the client's profile stays in the registry.
            <Button
              type="button"
              variant="outline"
              className="h-10 w-full sm:w-auto"
              onClick={resetClient}
              title="კლიენტი მოიხსნება ამ განაცხადიდან და შეგიძლიათ სხვა პირადი ნომერი მოძებნოთ. კლიენტის პროფილი არ წაიშლება."
            >
              <UserX className="size-4" />
              კლიენტის მოხსნა
            </Button>
          )}
        </div>
      ) : null}

      {client.status === "new" ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-info/30 bg-info/10 p-3.5 text-sm">
          <span>კლიენტი ვერ მოიძებნა — შეავსეთ მონაცემები ახალი კლიენტის დასარეგისტრირებლად.</span>
          <Button type="button" variant="ghost" className="h-10" onClick={resetClient}>
            სხვა ნომერი
          </Button>
        </div>
      ) : null}
    </WizardSection>
  )
}
