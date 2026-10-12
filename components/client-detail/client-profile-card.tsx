import { InfoCard } from "@/components/application-detail/info-card"
import { MARITAL_OPTIONS, optionLabel } from "@/components/application-wizard/wizard-options"
import { type Client } from "@/lib/clients"
import { formatDate } from "@/lib/format"

export function ClientProfileCard({ client }: { client: Client }) {
  const verified = client.legal_address_verified
    ? `გადამოწმებულია${client.legal_address_verified_at ? ` (${formatDate(client.legal_address_verified_at)})` : ""}`
    : "არ არის გადამოწმებული"

  return (
    <InfoCard
      title="კლიენტის მონაცემები"
      items={[
        { label: "პირადი ნომერი", value: client.personal_id, numeric: true },
        { label: "დაბადების თარიღი", value: client.birth_date ? formatDate(client.birth_date) : null, numeric: true },
        { label: "ტელეფონი", value: client.phone, numeric: true },
        { label: "ელ-ფოსტა", value: client.email },
        { label: "ოჯახური მდგომარეობა", value: optionLabel(MARITAL_OPTIONS, client.marital_status) },
        { label: "ოჯახის წევრები", value: client.family_members === null || client.family_members === undefined ? null : String(client.family_members), numeric: true },
        { label: "ფაქტიური მისამართი", value: client.address },
        { label: "იურიდიული მისამართი", value: client.legal_address },
        { label: "იურიდიული მისამართის გადამოწმება", value: client.legal_address ? verified : null },
      ]}
    />
  )
}
