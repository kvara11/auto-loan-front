"use client"

import { AlertCircle } from "lucide-react"

import { Field, FormInput } from "@/components/application-wizard/form-field"
import { toNumber, type CardProps } from "@/components/application-wizard/wizard-form"
import { WizardSection } from "@/components/application-wizard/wizard-section"
import { Textarea } from "@/components/ui/textarea"
import { displayLtv } from "@/lib/applications"
import { cn } from "@/lib/utils"

export function AppraisalCard(props: CardProps) {
  const { form, set } = props
  const ltv = displayLtv(toNumber(form.requested_amount), toNumber(form.market_value))
  const maxLtv = toNumber(form.max_ltv) || null
  const over = ltv !== null && maxLtv !== null && ltv > maxLtv

  return (
    <WizardSection title="შეფასება" description="საბაზრო ღირებულება და LTV (საორიენტაციო).">
      <FormInput {...props} name="market_value" label="საბაზრო ღირებულება (GEL)" number="decimal" placeholder="0.00" required />
      <FormInput {...props} name="comparable_count" label="ანალოგების რაოდენობა" number="integer" />
      <FormInput {...props} name="max_ltv" label="მაქს. LTV %" number="decimal" />
      <Field id="ltv" label="LTV">
        <div className={cn("flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-semibold tabular-nums", over ? "border-destructive/40 bg-destructive/10 text-destructive" : "bg-muted")}>
          {ltv === null ? "—" : `${ltv.toFixed(1)}%`}
          {over ? <AlertCircle className="size-4" /> : null}
        </div>
      </Field>
      {over ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive sm:col-span-2">
          ყურადღება: მოთხოვნილი თანხა აჭარბებს მაქსიმალურ დასაშვებ ლიმიტს (LTV &gt; {maxLtv}%). შენახვა და გაგზავნა არ იბლოკება.
        </p>
      ) : null}
      <Field id="vehicle_comment" label="ავტომობილის კომენტარი" className="sm:col-span-2">
        <Textarea id="vehicle_comment" rows={3} value={form.vehicle_comment} onChange={(event) => set("vehicle_comment", event.target.value)}
          placeholder="ზოგადი მდგომარეობა, დაზიანებები და ა.შ." />
      </Field>
      <Field id="officer_comment" label="ოფიცრის კომენტარი" className="sm:col-span-2">
        <Textarea id="officer_comment" rows={3} value={form.officer_comment} onChange={(event) => set("officer_comment", event.target.value)}
          placeholder="შეიყვანეთ ოფიცრის კომენტარი..." />
      </Field>
    </WizardSection>
  )
}
