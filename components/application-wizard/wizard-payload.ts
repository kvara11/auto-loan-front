import { type ApplicationRecord } from "@/components/applications/applications-types"
import {
  CLIENT_FIELDS,
  DEFAULT_FORM,
  INCOME_FIELDS,
  toNumber,
  type WizardForm,
} from "@/components/application-wizard/wizard-form"

const NUMBER_FIELDS = [
  "requested_amount", "loan_term_months", "annual_interest_rate", "commission_fee", "payment_day", "down_payment",
  "car_year", "mileage_km", "seller_price", "market_value", "comparable_count", "max_ltv", "engine",
] as const

const INCOME_NUMBERS = new Set(["existing_liabilities", "work_experience_months", "monthly_income", "entrepreneur_income", "additional_income"])

const blankToNull = (value: string) => (value.trim() === "" ? null : value.trim())

// POST/PUT /api/clients body.
export function toClientPayload(form: WizardForm) {
  return {
    ...Object.fromEntries(CLIENT_FIELDS.map((field) => [field, form[field]])),
    family_members: toNumber(form.family_members) ?? null,
    marital_status: form.marital_status || null,
  }
}

// POST/PUT /api/applications body: loan + vehicle fields, and incomes as the `income` snapshot.
// Empty values are sent as null so an edit can clear a field.
export function toApplicationPayload(form: WizardForm) {
  const payload: Record<string, unknown> = {}
  const skip = new Set<string>([...CLIENT_FIELDS, ...INCOME_FIELDS, "income_source_type", "lease_income_items"])

  for (const [key, value] of Object.entries(form)) {
    if (skip.has(key)) continue
    payload[key] = typeof value === "string" ? blankToNull(value) : value
  }
  for (const field of NUMBER_FIELDS) payload[field] = toNumber(form[field]) ?? null
  for (const field of ["car_make_id", "car_model_id", "fuel_type_id", "transmission_id"] as const) payload[field] = form[field] || null

  const income: Record<string, unknown> = { source_type: form.income_source_type || null }
  for (const field of INCOME_FIELDS) {
    const value = form[field]
    income[field] = INCOME_NUMBERS.has(field) ? toNumber(value as string) ?? null : typeof value === "string" ? blankToNull(value) : value
  }
  income.lease_items = form.lease_income_items.map((item) => ({ ...item, amount: toNumber(item.amount) ?? null }))
  payload.income = income

  return payload
}

const text = (value: unknown) => (value === null || value === undefined ? "" : String(value))
// 0 is the column default for "not filled in", so it shows as an empty field.
const amount = (value: unknown) => (value === null || value === undefined || Number(value) === 0 ? "" : String(Number(value)))

// Prefill the wizard from GET /api/applications/:id (edit mode).
export function fromApplication(app: ApplicationRecord): WizardForm {
  const client = app.client
  const income = app.income ?? {}
  const form: WizardForm = { ...DEFAULT_FORM }

  Object.assign(form, {
    personal_id: client.personal_id, first_name: client.first_name, last_name: client.last_name,
    birth_date: text(client.birth_date).slice(0, 10), phone: text(client.phone), email: text(client.email),
    marital_status: text(client.marital_status), family_members: text(client.family_members),
    address: text(client.address), legal_address: text(client.legal_address),
    legal_address_verified: Boolean(client.legal_address_verified),
  })

  for (const field of INCOME_FIELDS) {
    const value = (income as Record<string, unknown>)[field]
    if (value !== null && value !== undefined) Object.assign(form, { [field]: typeof value === "boolean" ? value : String(value) })
  }
  form.income_source_type = text(income.source_type)
  form.lease_income_items = (income.lease_items ?? []).map((item) => ({
    address: text(item.address), duration: text(item.duration), amount: amount(item.amount),
    currency: text(item.currency) || "GEL", cadastral: text(item.cadastral),
  }))

  const record = app as unknown as Record<string, unknown>
  for (const key of Object.keys(DEFAULT_FORM) as Array<keyof WizardForm>) {
    if (key in form && (CLIENT_FIELDS as readonly string[]).includes(key)) continue
    if (!(key in record) || typeof DEFAULT_FORM[key] !== "string") continue
    Object.assign(form, { [key]: (NUMBER_FIELDS as readonly string[]).includes(key) ? amount(record[key]) : text(record[key]) })
  }
  // A rate of 0 is a real value, unlike the other zeros.
  form.annual_interest_rate = text(app.annual_interest_rate === null ? "" : Number(app.annual_interest_rate))
  form.has_coborrower_guarantor = ["1", "true"].includes(String(app.has_coborrower_guarantor))
  form.car_make_id = app.car_make_id ?? 0
  form.car_model_id = app.car_model_id ?? 0
  form.fuel_type_id = app.fuel_type_id ?? 0
  form.transmission_id = app.transmission_id ?? 0

  return form
}
