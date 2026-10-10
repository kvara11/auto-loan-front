export type ApplicationRecord = {
  id: number
  application_no: string | null
  status: string
  client_id: number
  officer_id: number
  has_coborrower_guarantor: string | number
  co_borrower_name: string | null
  co_borrower_personal_id: string | null
  guarantor_name: string | null
  guarantor_personal_id: string | null
  requested_amount: string | number
  currency: string
  loan_term_months: number
  annual_interest_rate: string | number
  commission_fee: string | number
  commission_fee_type: "amount" | "percent"
  payment_day: number
  loan_purpose: string | null
  down_payment: string | number
  officer_comment: string | null
  car_make_id: number
  car_make: string | null
  car_model_id: number
  car_model: string | null
  car_year: number
  engine: string | null
  fuel_type_id: number
  fuel_type: string | null
  transmission_id: number
  transmission: string | null
  mileage_km: number
  vin: string | null
  plate_number: string | null
  seller_price: string | number
  customs_status: string | null
  vehicle_condition: string | null
  vehicle_comment: string | null
  market_value: string | number
  liquidation_value: string | number
  appraisal_confidence: string | number | null
  comparable_count: number
  ltv: string | number
  max_ltv: string | number
  ltv_warning: string | null
  // Workflow (set by the backend's ApplicationWorkflowService).
  submitted_at?: string | null
  decided_at?: string | null
  decided_by?: number | null
  decision_comment?: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  branch: { id: number; code: string; name: string } | null
  client: {
    id: number
    first_name: string
    last_name: string
    personal_id: string
    phone?: string | null
    email?: string | null
    address?: string | null
    legal_address?: string | null
    birth_date?: string | null
    marital_status?: string | null
    family_members?: number | null
    legal_address_verified?: boolean
    legal_address_verified_at?: string | null
  }
  // Incomes and liabilities as assessed for this application (Q-16).
  income?: ApplicationIncome | null
  officer: {
    id: number
    first_name: string
    last_name: string
    username: string
  }
}

// Workflow actions; the backend returns the ones the current user may take (`data.actions`).
export type ApplicationAction = "submit" | "return" | "approve" | "reject"

export type ApplicationDetails = {
  application: ApplicationRecord
  actions: ApplicationAction[]
  // The officer may still edit it (own application, Draft or Returned).
  can_edit: boolean
}

export type ApplicationIncome = {
  source_type?: "employee" | "entrepreneur" | "lease" | null
  existing_liabilities?: number | null
  employer?: string | null
  position?: string | null
  work_experience_months?: number | null
  monthly_income?: number | null
  monthly_income_currency?: string | null
  im_number?: string | null
  work_field?: string | null
  business_address?: string | null
  entrepreneur_income?: number | null
  entrepreneur_income_currency?: string | null
  lease_items?: Array<{ address?: string | null; duration?: string | null; amount?: number | null; currency?: string | null; cadastral?: string | null }> | null
  additional_income_enabled?: boolean | null
  additional_income_type?: string | null
  additional_income?: number | null
  additional_income_currency?: string | null
}

// One loan_logs entry: `action` is "created" or an ApplicationAction.
export type HistoryEntry = {
  id: number
  action: string
  from_status: string | null
  to_status: string | null
  comment: string | null
  user: { id: number; first_name: string; last_name: string } | null
  created_at: string
}
