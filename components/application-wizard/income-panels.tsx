"use client"

import { FormInput, FormSelect } from "@/components/application-wizard/form-field"
import { type CardProps } from "@/components/application-wizard/wizard-form"
import { CURRENCY_OPTIONS } from "@/components/application-wizard/wizard-options"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export function EmployeeIncome(props: CardProps) {
  return (
    <>
      <FormInput {...props} name="employer" label="დამსაქმებელი" />
      <FormInput {...props} name="position" label="პოზიცია" />
      <FormInput {...props} name="work_experience_months" label="გამოცდილება (თვე)" inputMode="numeric" />
      <div className="grid grid-cols-[1fr_96px] gap-2">
        <FormInput {...props} name="monthly_income" label="შემოსავალი" inputMode="decimal" placeholder="0.00" />
        <FormSelect {...props} name="monthly_income_currency" label="ვალუტა" options={CURRENCY_OPTIONS} />
      </div>
    </>
  )
}

export function EntrepreneurIncome(props: CardProps) {
  return (
    <>
      <FormInput {...props} name="im_number" label="ი/მ ნომერი" inputMode="numeric" />
      <FormInput {...props} name="work_field" label="საქმიანობის სფერო" />
      <FormInput {...props} name="business_address" label="ბიზნესის მისამართი" />
      <div className="grid grid-cols-[1fr_96px] gap-2">
        <FormInput {...props} name="entrepreneur_income" label="ყოველთვიური შემოსავალი" inputMode="decimal" placeholder="0.00" />
        <FormSelect {...props} name="entrepreneur_income_currency" label="ვალუტა" options={CURRENCY_OPTIONS} />
      </div>
      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label>მოვალეთა რეესტრი</Label>
        <Button type="button" variant="outline" className="h-10 w-fit" disabled title="მალე">
          შემოწმება
          <Badge variant="info">მალე</Badge>
        </Button>
      </div>
    </>
  )
}

export function AdditionalIncome(props: CardProps) {
  return (
    <>
      <FormInput {...props} name="additional_income_type" label="შემოსავლის ტიპი" placeholder="დივიდენდი, იჯარა და ა.შ." />
      <div className="grid grid-cols-[1fr_96px] gap-2">
        <FormInput {...props} name="additional_income" label="თანხა" inputMode="decimal" placeholder="0.00" />
        <FormSelect {...props} name="additional_income_currency" label="ვალუტა" options={CURRENCY_OPTIONS} />
      </div>
    </>
  )
}
