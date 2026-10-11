"use client"

import { FormCheckbox, FormInput } from "@/components/application-wizard/form-field"
import { type CardProps } from "@/components/application-wizard/wizard-form"
import { WizardSection } from "@/components/application-wizard/wizard-section"
import { PERSONAL_ID_WIDTH } from "@/lib/utils"

export function GuarantorCard(props: CardProps) {
  return (
    <WizardSection title="თანამსესხებელი / თავდები" description="დამატებითი პირების მონაცემები.">
      <div className="sm:col-span-2">
        <FormCheckbox {...props} name="has_coborrower_guarantor" label="თანამსესხებლის/თავდების არსებობა" />
      </div>
      {props.form.has_coborrower_guarantor ? (
        <>
          <FormInput {...props} name="co_borrower_name" label="თანამსესხებელი — სახელი, გვარი" />
          <FormInput {...props} name="co_borrower_personal_id" label="თანამსესხებელი — პირადი ნომერი" digits maxLength={11} className={PERSONAL_ID_WIDTH} />
          <FormInput {...props} name="guarantor_name" label="თავდები — სახელი, გვარი" />
          <FormInput {...props} name="guarantor_personal_id" label="თავდები — პირადი ნომერი" digits maxLength={11} className={PERSONAL_ID_WIDTH} />
        </>
      ) : null}
    </WizardSection>
  )
}
