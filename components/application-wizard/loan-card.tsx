"use client"

import { Field, FormInput, FormSelect } from "@/components/application-wizard/form-field"
import { toNumber, type CardProps } from "@/components/application-wizard/wizard-form"
import { FEE_TYPE_OPTIONS } from "@/components/application-wizard/wizard-options"
import { WizardSection } from "@/components/application-wizard/wizard-section"
import { Badge } from "@/components/ui/badge"

// Down payment as a share of the price (seller price, or amount + down payment) — display only.
function downPaymentShare(props: CardProps) {
  const down = toNumber(props.form.down_payment) ?? 0
  const price = toNumber(props.form.seller_price) || (toNumber(props.form.requested_amount) ?? 0) + down
  return down > 0 && price > 0 ? (down / price) * 100 : null
}

export function LoanCard(props: CardProps) {
  const share = downPaymentShare(props)

  return (
    <WizardSection title="სესხის პირობები" description="მოთხოვნილი კრედიტის პარამეტრები.">
      <FormInput {...props} name="requested_amount" label="მოთხოვნილი თანხა (GEL)" inputMode="decimal" placeholder="0.00" required />
      <FormInput {...props} name="loan_term_months" label="ვადა (თვე)" inputMode="numeric" required />
      <FormInput {...props} name="annual_interest_rate" label="წლიური განაკვეთი %" inputMode="decimal" required />
      <Field id="monthly_payment" label="ყოველთვიური გადასახადი">
        <div className="flex h-10 items-center gap-2 rounded-lg border bg-muted px-3 text-sm text-muted-foreground">
          — <Badge variant="info">მალე</Badge>
        </div>
      </Field>
      <div className="grid grid-cols-[1fr_88px] gap-2">
        <FormInput {...props} name="commission_fee" label="საკომისიო" inputMode="decimal" />
        <FormSelect {...props} name="commission_fee_type" label="ტიპი" options={FEE_TYPE_OPTIONS} />
      </div>
      <FormInput {...props} name="payment_day" label="გადახდის დღე" inputMode="numeric" placeholder="1–31" required />
      <div className="flex flex-col gap-1">
        <FormInput {...props} name="down_payment" label="თანამონაწილეობა (GEL)" inputMode="decimal" placeholder="0.00" />
        {share !== null ? <span className="text-xs text-muted-foreground tabular-nums">{share.toFixed(1)}% წილი</span> : null}
      </div>
      <FormInput {...props} name="loan_purpose" label="სესხის მიზნობრიობა" placeholder="მაგ: ავტომობილის შეძენა" />
    </WizardSection>
  )
}
