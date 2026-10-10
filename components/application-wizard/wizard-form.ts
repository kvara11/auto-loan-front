// The new/edit application wizard's form state: every field the old form had, as strings
// (inputs), booleans (checkboxes) or ids (selects, 0 = none). Payload mapping: wizard-payload.ts.
export type LeaseItem = { address: string; duration: string; amount: string; currency: string; cadastral: string }

export type WizardForm = {
  // Client (step 1) — saved through /api/clients.
  personal_id: string
  first_name: string
  last_name: string
  birth_date: string
  phone: string
  email: string
  marital_status: string
  family_members: string
  address: string
  legal_address: string
  legal_address_verified: boolean
  // Income and liabilities — the application's `income` snapshot (Q-16).
  income_source_type: string
  existing_liabilities: string
  employer: string
  position: string
  work_experience_months: string
  monthly_income: string
  monthly_income_currency: string
  im_number: string
  work_field: string
  business_address: string
  entrepreneur_income: string
  entrepreneur_income_currency: string
  lease_income_items: LeaseItem[]
  additional_income_enabled: boolean
  additional_income_type: string
  additional_income: string
  additional_income_currency: string
  // Loan.
  requested_amount: string
  currency: string
  loan_term_months: string
  annual_interest_rate: string
  commission_fee: string
  commission_fee_type: string
  payment_day: string
  down_payment: string
  loan_purpose: string
  // Co-borrower / guarantor.
  has_coborrower_guarantor: boolean
  co_borrower_name: string
  co_borrower_personal_id: string
  guarantor_name: string
  guarantor_personal_id: string
  // Vehicle and appraisal.
  car_make_id: number
  car_model_id: number
  car_year: string
  engine: string
  fuel_type_id: number
  transmission_id: number
  mileage_km: string
  vin: string
  plate_number: string
  seller_price: string
  customs_status: string
  vehicle_condition: string
  market_value: string
  comparable_count: string
  max_ltv: string
  vehicle_comment: string
  officer_comment: string
}

export type WizardErrors = Partial<Record<string, string>>

export type SetField = <K extends keyof WizardForm>(field: K, value: WizardForm[K]) => void

// What every wizard card receives.
export type CardProps = { form: WizardForm; errors: WizardErrors; set: SetField }

export const EMPTY_LEASE_ITEM: LeaseItem = { address: "", duration: "", amount: "", currency: "GEL", cadastral: "" }

export const DEFAULT_FORM: WizardForm = {
  personal_id: "", first_name: "", last_name: "", birth_date: "", phone: "", email: "",
  marital_status: "", family_members: "", address: "", legal_address: "", legal_address_verified: false,
  income_source_type: "", existing_liabilities: "", employer: "", position: "", work_experience_months: "",
  monthly_income: "", monthly_income_currency: "GEL", im_number: "", work_field: "", business_address: "",
  entrepreneur_income: "", entrepreneur_income_currency: "GEL", lease_income_items: [],
  additional_income_enabled: false, additional_income_type: "", additional_income: "", additional_income_currency: "GEL",
  requested_amount: "", currency: "GEL", loan_term_months: "", annual_interest_rate: "", commission_fee: "",
  commission_fee_type: "percent", payment_day: "", down_payment: "", loan_purpose: "",
  has_coborrower_guarantor: false, co_borrower_name: "", co_borrower_personal_id: "", guarantor_name: "", guarantor_personal_id: "",
  car_make_id: 0, car_model_id: 0, car_year: "", engine: "", fuel_type_id: 0, transmission_id: 0, mileage_km: "",
  vin: "", plate_number: "", seller_price: "", customs_status: "", vehicle_condition: "",
  market_value: "", comparable_count: "", max_ltv: "80", vehicle_comment: "", officer_comment: "",
}

export const CLIENT_FIELDS = [
  "personal_id", "first_name", "last_name", "birth_date", "phone", "email",
  "marital_status", "family_members", "address", "legal_address", "legal_address_verified",
] as const

export const INCOME_FIELDS = [
  "existing_liabilities", "employer", "position", "work_experience_months", "monthly_income", "monthly_income_currency",
  "im_number", "work_field", "business_address", "entrepreneur_income", "entrepreneur_income_currency",
  "additional_income_enabled", "additional_income_type", "additional_income", "additional_income_currency",
] as const

// Strips thousands separators and spaces; "" or garbage → undefined (left out of the payload).
export function toNumber(value: string | number | undefined | null) {
  if (value === undefined || value === null) return undefined
  if (typeof value === "number") return value

  const clean = value.replace(/,/g, "").replace(/\s/g, "")
  if (clean === "") return undefined

  const parsed = Number(clean)
  return Number.isNaN(parsed) ? undefined : parsed
}
