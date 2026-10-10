import { type ApplicationRecord } from "@/components/applications/applications-types"
import { InfoCard, type InfoItem } from "@/components/application-detail/info-card"
import { INCOME_TYPE_OPTIONS, optionLabel } from "@/components/application-wizard/wizard-options"
import { formatMoney } from "@/lib/format"

const money = (value: number | null | undefined, currency?: string | null) =>
  value === null || value === undefined ? null : formatMoney(value, currency || "GEL")

// The application's income snapshot (Q-16), as the officer assessed it.
export function IncomeInfoCard({ app }: { app: ApplicationRecord }) {
  const income = app.income ?? {}
  const items: InfoItem[] = [
    { label: "შემოსავლის ტიპი", value: optionLabel(INCOME_TYPE_OPTIONS, income.source_type) },
    { label: "არსებული ვალდებულებები", value: money(income.existing_liabilities), numeric: true },
  ]

  if (income.source_type === "employee") {
    items.push(
      { label: "დამსაქმებელი", value: income.employer },
      { label: "პოზიცია", value: income.position },
      { label: "გამოცდილება", value: income.work_experience_months ? `${income.work_experience_months} თვე` : null, numeric: true },
      { label: "შემოსავალი (თვიური)", value: money(income.monthly_income, income.monthly_income_currency), numeric: true },
    )
  }
  if (income.source_type === "entrepreneur") {
    items.push(
      { label: "ი/მ ნომერი", value: income.im_number, numeric: true },
      { label: "საქმიანობის სფერო", value: income.work_field },
      { label: "ბიზნესის მისამართი", value: income.business_address },
      { label: "შემოსავალი (თვიური)", value: money(income.entrepreneur_income, income.entrepreneur_income_currency), numeric: true },
    )
  }
  if (income.source_type === "lease") {
    for (const [index, item] of (income.lease_items ?? []).entries()) {
      items.push({
        label: `იჯარა ${index + 1}${item.address ? ` — ${item.address}` : ""}`,
        value: [money(item.amount, item.currency), item.duration, item.cadastral].filter(Boolean).join(" · "),
        numeric: true,
      })
    }
  }
  if (income.additional_income_enabled) {
    items.push({ label: `დამატებითი შემოსავალი${income.additional_income_type ? ` (${income.additional_income_type})` : ""}`, value: money(income.additional_income, income.additional_income_currency), numeric: true })
  }

  if (!app.income) items.splice(0, items.length, { label: "შემოსავლები", value: "არ არის შევსებული" })

  return <InfoCard title="შემოსავლები და ვალდებულებები" items={items} />
}

