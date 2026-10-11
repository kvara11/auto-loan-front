"use client"

import { FormCheckbox, FormInput, FormSelect } from "@/components/application-wizard/form-field"
import { AdditionalIncome, EmployeeIncome, EntrepreneurIncome } from "@/components/application-wizard/income-panels"
import { LeaseItems } from "@/components/application-wizard/lease-items"
import { type CardProps } from "@/components/application-wizard/wizard-form"
import { INCOME_TYPE_OPTIONS } from "@/components/application-wizard/wizard-options"
import { WizardSection } from "@/components/application-wizard/wizard-section"

// Saved as the application's income snapshot (Q-16): what was assessed for this application.
export function IncomeCard(props: CardProps) {
  const type = props.form.income_source_type

  return (
    <WizardSection title="შემოსავლები და ვალდებულებები" description="ინფორმაცია ფინანსური მდგომარეობის შესახებ.">
      <FormSelect {...props} name="income_source_type" label="შემოსავლის ტიპი" options={INCOME_TYPE_OPTIONS} placeholder="აირჩიეთ ტიპი" />
      <FormInput {...props} name="existing_liabilities" label="არსებული ვალდებულებები (GEL)" number="decimal" placeholder="0.00" />

      {type === "employee" ? <EmployeeIncome {...props} /> : null}
      {type === "entrepreneur" ? <EntrepreneurIncome {...props} /> : null}
      {type === "lease" ? <LeaseItems {...props} /> : null}

      <div className="sm:col-span-2">
        <FormCheckbox {...props} name="additional_income_enabled" label="დამატებითი შემოსავალი" />
      </div>
      {props.form.additional_income_enabled ? <AdditionalIncome {...props} /> : null}
    </WizardSection>
  )
}
