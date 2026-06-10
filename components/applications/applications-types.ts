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
  created_at: string
  updated_at: string
  deleted_at: string | null
  client: {
    id: number
    first_name: string
    last_name: string
    username: string | null
  }
  officer: {
    id: number
    first_name: string
    last_name: string
    username: string
  }
}
