import { type ApplicationRecord } from "@/components/applications/applications-types"
import { InfoCard } from "@/components/application-detail/info-card"
import { MARITAL_OPTIONS, optionLabel } from "@/components/application-wizard/wizard-options"
import { shortName } from "@/lib/applications"
import { formatMoney, formatNumber } from "@/lib/format"

const percent = (value: string | number | null | undefined) =>
  value === null || value === undefined || value === "" ? "—" : `${formatNumber(value)}%`

// Amount columns default to 0 when a draft leaves them empty, so 0 shows as "—".
const money = (value: string | number | null | undefined, currency: string) => (Number(value) > 0 ? formatMoney(value, currency) : null)

export function ClientCard({ app }: { app: ApplicationRecord }) {
  const { client } = app
  const coBorrower = app.co_borrower_name || app.guarantor_name

  return (
    <InfoCard
      title="კლიენტი"
      items={[
        { label: "სახელი, გვარი", value: `${client.first_name} ${client.last_name}` },
        { label: "პირადი ნომერი", value: client.personal_id, numeric: true },
        { label: "ტელეფონი", value: client.phone, numeric: true },
        { label: "ელ-ფოსტა", value: client.email },
        { label: "ოჯახური მდგომარეობა", value: optionLabel(MARITAL_OPTIONS, client.marital_status) },
        { label: "ოჯახის წევრები", value: client.family_members === null || client.family_members === undefined ? null : String(client.family_members), numeric: true },
        { label: "თავდები / თანამსესხებელი", value: coBorrower || "არ არის" },
        { label: "ფაქტიური მისამართი", value: client.address },
        { label: "იურიდიული მისამართი", value: client.legal_address ? `${client.legal_address}${client.legal_address_verified ? " ✓" : ""}` : null },
      ]}
    />
  )
}

export function LoanCard({ app }: { app: ApplicationRecord }) {
  const fee = !(Number(app.commission_fee) > 0) ? null : app.commission_fee_type === "percent" ? percent(app.commission_fee) : formatMoney(app.commission_fee, app.currency)

  return (
    <InfoCard
      title="სესხის პირობები"
      items={[
        { label: "მოთხოვნილი თანხა", value: money(app.requested_amount, app.currency), numeric: true },
        { label: "ვადა", value: app.loan_term_months ? `${app.loan_term_months} თვე` : null, numeric: true },
        { label: "საპროცენტო განაკვეთი", value: percent(app.annual_interest_rate), numeric: true },
        { label: "ყოველთვიური გადასახადი", soon: true },
        { label: "თანამონაწილეობა", value: money(app.down_payment, app.currency), numeric: true },
        { label: "საკომისიო", value: fee, numeric: true },
        { label: "მიზნობრიობა", value: app.loan_purpose },
        { label: "ფილიალი", value: app.branch ? `${app.branch.code} · ${app.branch.name}` : null },
        { label: "საკრედიტო ოფიცერი", value: shortName(app.officer) },
      ]}
    />
  )
}

export function VehicleCard({ app }: { app: ApplicationRecord }) {
  return (
    <InfoCard
      title="ავტომობილი და შეფასება"
      items={[
        { label: "მარკა / მოდელი", value: [app.car_make, app.car_model].filter(Boolean).join(" ") },
        { label: "წელი", value: app.car_year ? String(app.car_year) : null, numeric: true },
        { label: "გარბენი", value: app.mileage_km ? `${formatNumber(app.mileage_km)} კმ` : null, numeric: true },
        { label: "გადაცემათა კოლოფი", value: app.transmission },
        { label: "VIN", value: app.vin, numeric: true },
        { label: "სახელმწიფო ნომერი", value: app.plate_number },
        { label: "გამყიდველის ფასი", value: money(app.seller_price, app.currency), numeric: true },
        { label: "საბაზრო ღირებულება", value: money(app.market_value, app.currency), numeric: true },
        { label: "სალიკვიდაციო ღირებულება", value: money(app.liquidation_value, app.currency), numeric: true },
      ]}
    />
  )
}
