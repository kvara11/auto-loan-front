import { MARITAL_OPTIONS, optionLabel } from "@/components/application-wizard/wizard-options"
import { api } from "@/lib/axios"
import { formatDateTime } from "@/lib/format"
import { type PageMeta } from "@/lib/pagination"
import { API_ROUTES } from "@/lib/routes"

// The change log (T-206): GET /api/admin/audit-events, read-only for audit.view.

export type AuditValues = Record<string, unknown> | null

export type AuditEvent = {
  id: number
  action: string
  action_label: string
  subject_type: string | null
  subject_id: number | null
  subject_label: string | null
  old_values: AuditValues
  new_values: AuditValues
  ip: string | null
  user: { id: number; first_name: string; last_name: string; username: string; avatar_url?: string | null } | null
  created_at: string
}

// "" means no filter; dates are "YYYY-MM-DD", inclusive.
export type AuditFilters = { search: string; action: string; subject_type: string; start_date: string; end_date: string }

export const EMPTY_AUDIT_FILTERS: AuditFilters = { search: "", action: "", subject_type: "", start_date: "", end_date: "" }

export const AUDIT_PAGE_SIZES = [25, 50, 100]

export const SUBJECT_TYPE_LABELS: Record<string, string> = {
  user: "მომხმარებელი",
  role: "როლი",
  branch: "ფილიალი",
  global_setting: "პარამეტრი",
  client: "კლიენტი",
  reference_data: "ცნობარი",
}

const FIELD_LABELS: Record<string, string> = {
  first_name: "სახელი",
  last_name: "გვარი",
  username: "მომხმარებლის სახელი",
  email: "ელფოსტა",
  branch: "ფილიალი",
  role: "როლი",
  name: "დასახელება",
  display_name: "ქართული დასახელება",
  code: "კოდი",
  is_active: "აქტიური",
  value: "მნიშვნელობა",
  permissions: "უფლებები",
  personal_id: "პირადი ნომერი",
  birth_date: "დაბადების თარიღი",
  phone: "ტელეფონი",
  address: "ფაქტობრივი მისამართი",
  legal_address: "იურიდიული მისამართი",
  marital_status: "ოჯახური მდგომარეობა",
  family_members: "ოჯახის წევრები",
  legal_address_verified_at: "მისამართი გადამოწმდა",
  legal_address_verified_by: "გადაამოწმა",
  reason: "მიზეზი",
}

const REASON_LABELS: Record<string, string> = {
  wrong_password: "არასწორი პაროლი",
  unknown_user: "უცნობი მომხმარებელი",
  deactivated: "დაბლოკილი ანგარიში",
}

export const fieldLabel = (key: string) => FIELD_LABELS[key] ?? key

// A stored value as text: "—" for empty, "კი"/"არა" for booleans, Georgian labels for known codes.
export function formatAuditValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "—"
  if (typeof value === "boolean") return value ? "კი" : "არა"
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—"
  if (key === "reason") return REASON_LABELS[String(value)] ?? String(value)
  if (key === "marital_status") return optionLabel(MARITAL_OPTIONS, String(value))
  if (key.endsWith("_at")) return formatDateTime(String(value))
  return typeof value === "object" ? JSON.stringify(value) : String(value)
}

// Badge tone by kind of action (never color alone: the label is always shown).
export function actionVariant(action: string) {
  if (action === "login_failed" || action === "user_deactivated" || action.endsWith("_deleted") || action.endsWith("_removed")) return "destructive"
  if (action === "password_changed" || action === "global_setting_updated") return "warning"
  if (action.endsWith("_created") || action === "user_activated") return "success"
  if (action.startsWith("client_")) return "info"
  return "secondary"
}

export async function fetchAuditEvents(filters: AuditFilters, page: number, perPage: number) {
  const params = { ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== "")), page, per_page: perPage }
  const response = await api.get<{ events?: AuditEvent[]; actions?: Record<string, string> }>(API_ROUTES.admin.auditEvents, { params })
  if (!response.success) throw new Error(response.message || "ჟურნალის ჩატვირთვა ვერ მოხერხდა")

  const events = response.data?.events ?? []
  const meta = (response.meta as PageMeta | undefined) ?? { current_page: page, per_page: perPage, total: events.length, last_page: 1 }

  return { events, actions: response.data?.actions ?? {}, meta }
}
