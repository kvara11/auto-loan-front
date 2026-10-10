"use client"

import Link from "next/link"

import { AppraisalCard } from "@/components/application-wizard/appraisal-card"
import { ClientDetailsCard } from "@/components/application-wizard/client-details-card"
import { ClientLookupCard } from "@/components/application-wizard/client-lookup-card"
import { GuarantorCard } from "@/components/application-wizard/guarantor-card"
import { IncomeCard } from "@/components/application-wizard/income-card"
import { LoanCard } from "@/components/application-wizard/loan-card"
import { useApplicationWizard } from "@/components/application-wizard/use-application-wizard"
import { VehicleCard } from "@/components/application-wizard/vehicle-card"
import { WizardStepper } from "@/components/application-wizard/wizard-stepper"
import { WizardSummary } from "@/components/application-wizard/wizard-summary"
import { FormNotice } from "@/components/settings/settings-section"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

// New application (no id) or editing a Draft/Returned one (id). Design: NewApplicationWizard.
export function ApplicationWizard({ applicationId }: { applicationId?: string }) {
  const wizard = useApplicationWizard(applicationId)
  const card = { form: wizard.form, errors: wizard.errors, set: wizard.set }

  if (wizard.loadError) {
    return (
      <div className="flex min-h-65 flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-card px-6 text-center">
        <p className="max-w-lg text-base font-medium">{wizard.loadError}</p>
        <Button asChild variant="outline" className="h-10">
          <Link href={applicationId ? `/dashboard/applications/${applicationId}` : "/dashboard/applications"}>უკან</Link>
        </Button>
      </div>
    )
  }

  if (wizard.loading) {
    return <Skeleton className="h-[480px] rounded-xl" aria-busy="true" />
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <WizardStepper step={wizard.step} />
        {wizard.applicationNo ? <span className="text-sm font-semibold text-muted-foreground tabular-nums">{wizard.applicationNo}</span> : null}
      </div>
      {wizard.banner ? <FormNotice tone="error">{wizard.banner}</FormNotice> : null}

      <div className="grid items-start gap-5 lg:grid-cols-[2fr_1fr]">
        <div className="flex min-w-0 flex-col gap-5">
          {wizard.step === 1 ? (
            <>
              <ClientLookupCard wizard={wizard} />
              <ClientDetailsCard {...card} />
            </>
          ) : (
            <>
              <IncomeCard {...card} />
              <LoanCard {...card} />
              <GuarantorCard {...card} />
              <VehicleCard {...card} />
              <AppraisalCard {...card} />
            </>
          )}
        </div>
        <WizardSummary wizard={wizard} />
      </div>
    </div>
  )
}
