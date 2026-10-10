"use client"

import { FormCheckbox, FormInput, FormSelect } from "@/components/application-wizard/form-field"
import { type CardProps } from "@/components/application-wizard/wizard-form"
import { MARITAL_OPTIONS } from "@/components/application-wizard/wizard-options"
import { WizardSection } from "@/components/application-wizard/wizard-section"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// "კლიენტის მონაცემები": saved to the client profile (shared registry) on "შემდეგი".
export function ClientDetailsCard(props: CardProps) {
  return (
    <WizardSection title="კლიენტის მონაცემები" description="შეიყვანეთ ძირითადი ინფორმაცია კლიენტის შესახებ.">
      <FormInput {...props} name="first_name" label="სახელი" required />
      <FormInput {...props} name="last_name" label="გვარი" required />
      <FormInput {...props} name="birth_date" label="დაბადების თარიღი" type="date" required />
      <FormInput {...props} name="phone" label="ტელეფონი" placeholder="5XXXXXXXX" inputMode="tel" required />
      <FormInput {...props} name="email" label="ელ-ფოსტა" type="email" />
      <FormSelect {...props} name="marital_status" label="ოჯახური მდგომარეობა" options={MARITAL_OPTIONS} />
      <FormInput {...props} name="family_members" label="ოჯახის წევრების რაოდენობა" inputMode="numeric" />
      <FormInput {...props} name="address" label="ფაქტიური მისამართი" />
      <FormInput {...props} name="legal_address" label="იურიდიული მისამართი" className="sm:col-span-2" />
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        {/* A manual mark: the backend records who set it and when (no registry integration yet). */}
        <FormCheckbox {...props} name="legal_address_verified" label="იურიდიული მისამართი გადამოწმებულია" />
        <Button type="button" variant="outline" className="h-10" disabled title="მალე">
          ავტომატური გადამოწმება
          <Badge variant="info">მალე</Badge>
        </Button>
      </div>
    </WizardSection>
  )
}
