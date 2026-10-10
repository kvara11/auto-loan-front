import { toNumber, type WizardErrors, type WizardForm } from "@/components/application-wizard/wizard-form"

const REQUIRED = "სავალდებულო ველი"

// Step 1: the client. The backend requires names; the officer's process also needs these.
export function clientErrors(form: WizardForm): WizardErrors {
  const errors: WizardErrors = {}

  if (!/^\d{11}$/.test(form.personal_id)) errors.personal_id = "პირადი ნომერი უნდა შედგებოდეს 11 ციფრისგან"
  for (const field of ["first_name", "last_name", "birth_date", "phone"] as const) {
    if (!form[field].trim()) errors[field] = REQUIRED
  }
  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = "იმეილის ფორმატი არასწორია"

  return errors
}

// Submitting to risks: mirrors ApplicationWorkflowService::REQUIRED_FOR_SUBMIT on the backend,
// which stays the authority (its 424 errors are shown on the same fields).
export function submitErrors(form: WizardForm): WizardErrors {
  const errors: WizardErrors = {}
  const positive = ["requested_amount", "loan_term_months", "payment_day", "car_year", "market_value"] as const

  for (const field of positive) {
    if (!((toNumber(form[field]) ?? 0) > 0)) errors[field] = REQUIRED
  }
  if (toNumber(form.annual_interest_rate) === undefined) errors.annual_interest_rate = REQUIRED
  for (const field of ["car_make_id", "car_model_id", "fuel_type_id", "transmission_id"] as const) {
    if (!form[field]) errors[field] = REQUIRED
  }

  return errors
}

// Backend 424 keys → form fields: "income.monthly_income" → "monthly_income",
// "income.lease_items.0.amount" → "lease_income_items" (shown under the lease list).
export function mapServerErrors(errors: Record<string, string>): WizardErrors {
  const mapped: WizardErrors = {}

  for (const [key, message] of Object.entries(errors)) {
    const field = key.startsWith("income.lease_items")
      ? "lease_income_items"
      : key === "income.source_type"
        ? "income_source_type"
        : key.replace(/^income\./, "")
    mapped[field] ??= message
  }

  return mapped
}
