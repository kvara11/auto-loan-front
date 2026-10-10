// Application statuses as the backend stores them (human-readable strings), mapped to the
// design system's status tokens (--status-*) and Georgian labels.
export type StatusKey = "draft" | "submitted" | "approved" | "rejected" | "returned"

type StatusInfo = { key: StatusKey; label: string; shortLabel: string }

const STATUSES: Record<string, StatusInfo> = {
  Draft: { key: "draft", label: "მონახაზი", shortLabel: "მონახაზი" },
  "Submitted to Risks": { key: "submitted", label: "გაგზავნილია რისკებში", shortLabel: "გაგზავნილია" },
  Approved: { key: "approved", label: "დამტკიცებული", shortLabel: "დამტკიცებული" },
  Rejected: { key: "rejected", label: "უარყოფილი", shortLabel: "უარყოფილი" },
  Returned: { key: "returned", label: "დაბრუნებული", shortLabel: "დაბრუნებული" },
}

// Order used by charts and filters.
export const STATUS_ORDER = ["Draft", "Submitted to Risks", "Approved", "Returned", "Rejected"] as const

// Not yet decided: still with the officer or the risk team.
export const IN_PROGRESS_STATUSES = ["Draft", "Submitted to Risks", "Returned"]

export function getStatusInfo(status: string | null | undefined): StatusInfo {
  if (status && STATUSES[status]) return STATUSES[status]

  // Unknown strings keep the neutral draft style and show the raw value.
  const raw = status || "—"
  return { key: "draft", label: raw, shortLabel: raw }
}

// History (loan_logs) action → timeline label.
const HISTORY_LABELS: Record<string, string> = {
  created: "შექმნილია — მონახაზი",
  updated: "რედაქტირებულია",
  submit: "გაგზავნილია რისკებში",
  return: "დაბრუნებულია ოფიცერთან",
  approve: "დამტკიცებულია",
  reject: "უარყოფილია",
}

export function getHistoryLabel(action: string) {
  return HISTORY_LABELS[action] ?? action
}
