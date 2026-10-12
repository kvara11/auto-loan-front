"use client"

import { ClientFields } from "@/components/application-wizard/client-fields"
import { type CardProps } from "@/components/application-wizard/wizard-form"
import { WizardSection } from "@/components/application-wizard/wizard-section"

// "კლიენტის მონაცემები": saved to the client profile (shared registry) on "შემდეგი".
export function ClientDetailsCard(props: CardProps) {
  return (
    <WizardSection title="კლიენტის მონაცემები" description="შეიყვანეთ ძირითადი ინფორმაცია კლიენტის შესახებ.">
      <ClientFields {...props} />
    </WizardSection>
  )
}
