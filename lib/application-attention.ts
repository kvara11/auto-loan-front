// The dashboard's "ყურადღება!" categories (the backend's App\Support\ApplicationAttention).
// Each opens the applications list filtered to exactly those applications: /dashboard/applications?attention=<key>.

export type AttentionKey = "waiting_48h" | "returned" | "old_drafts" | "without_attachments" | "over_ltv"

// "d" = past a deadline (clock icon, destructive), "w" = needs attention (triangle, warning).
export const ATTENTION: Record<AttentionKey, { label: string; tone: "d" | "w" }> = {
  waiting_48h: { label: "რისკებში 48 სთ-ზე მეტი", tone: "d" },
  returned: { label: "დაბრუნებული, ხელახლა არ გაგზავნილი", tone: "w" },
  old_drafts: { label: "7 დღეზე ძველი მონახაზები", tone: "w" },
  without_attachments: { label: "დანართის გარეშე", tone: "w" },
  over_ltv: { label: "LTV ლიმიტს ზემოთ", tone: "w" },
}

export const isAttentionKey = (value: string | null | undefined): value is AttentionKey => !!value && value in ATTENTION

export const attentionHref = (key: AttentionKey) => `/dashboard/applications?attention=${key}`

export const ATTENTION_TONE = {
  d: {
    row: "border-[color-mix(in_oklch,var(--destructive)_35%,var(--border))] bg-[color-mix(in_oklch,var(--destructive)_10%,var(--card))]",
    icon: "bg-[color-mix(in_oklch,var(--destructive)_18%,var(--card))] text-destructive",
  },
  w: {
    row: "border-[color-mix(in_oklch,var(--warning)_40%,var(--border))] bg-[color-mix(in_oklch,var(--warning)_14%,var(--card))]",
    icon: "bg-[color-mix(in_oklch,var(--warning)_30%,var(--card))] text-[color-mix(in_oklch,var(--warning)_45%,var(--foreground))]",
  },
}
