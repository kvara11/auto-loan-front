"use client"

import { ArrowLeft, ArrowRight, Loader2, Save, Send } from "lucide-react"

import { type WizardState } from "@/components/application-wizard/use-application-wizard"
import { toNumber } from "@/components/application-wizard/wizard-form"
import { Button } from "@/components/ui/button"
import { displayLtv } from "@/lib/applications"
import { formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-semibold tabular-nums">{value}</span>
    </div>
  )
}

// "შეჯამება" (design: sticky on the right) with the wizard's buttons.
export function WizardSummary({ wizard }: { wizard: WizardState }) {
  const { form, step, setStep, next, saveDraft, submit, saving } = wizard
  const ltv = displayLtv(toNumber(form.requested_amount), toNumber(form.market_value))
  const maxLtv = toNumber(form.max_ltv) || null
  const over = ltv !== null && maxLtv !== null && ltv > maxLtv
  const busy = saving !== null
  const name = [form.first_name, form.last_name].filter(Boolean).join(" ")
  const spin = (kind: typeof saving) => (saving === kind ? <Loader2 className="size-4 animate-spin" /> : null)

  return (
    <aside className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-sm sm:p-[22px] lg:sticky lg:top-6">
      <h2 className="text-[17px] font-semibold">შეჯამება</h2>
      <div className="flex flex-col gap-2.5">
        <Row label="კლიენტი" value={name || "—"} />
        <Row label="მოთხოვნილი თანხა" value={toNumber(form.requested_amount) ? formatMoney(toNumber(form.requested_amount), "GEL") : "—"} />
        <Row label="საბაზრო ღირებულება (ავტო)" value={toNumber(form.market_value) ? formatMoney(toNumber(form.market_value), "GEL") : "—"} />
      </div>
      <div className="flex items-baseline justify-between gap-3 border-t pt-3">
        <span className="text-sm font-semibold">LTV</span>
        <span className={cn("text-right text-sm font-bold tabular-nums", over && "text-destructive")}>
          {ltv === null ? "—" : `${Math.round(ltv)}%`}
          {over ? ` — აჭარბებს ${maxLtv}% ლიმიტს` : ""}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {step === 2 ? (
          <Button type="button" variant="outline" className="h-10" onClick={() => setStep(1)} disabled={busy}>
            <ArrowLeft className="size-4" /> წინა ნაბიჯი
          </Button>
        ) : (
          <Button type="button" className="h-10" onClick={next} disabled={busy}>
            {spin("next")} შემდეგი <ArrowRight className="size-4" />
          </Button>
        )}
        {step === 2 ? (
          <Button type="button" className="h-10" onClick={submit} disabled={busy}>
            {spin("submit") ?? <Send className="size-4" />} გაგზავნა რისკებში
          </Button>
        ) : null}
        <Button type="button" variant="ghost" className="h-10" onClick={saveDraft} disabled={busy}>
          {spin("draft") ?? <Save className="size-4" />} მონახაზად შენახვა
        </Button>
      </div>
    </aside>
  )
}
