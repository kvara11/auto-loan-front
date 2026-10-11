import { ergative, money, shortNo } from "@/lib/dashboard/format"
import { type ActivityEvent } from "@/lib/dashboard/types"

// One activity-feed sentence: "ნ. ბერიძემ დაამტკიცა 001-6ACB… · Toyota Prius · 18,400 ₾".
// The signed-in user's own events read "თქვენ გაგზავნეთ …".

const VERBS: Record<string, [string, string]> = {
  created: ["შექმნა მონახაზი", "შექმენით მონახაზი"],
  submit: ["გაგზავნა", "გაგზავნეთ"],
  resubmit: ["ხელახლა გაგზავნა", "ხელახლა გაგზავნეთ"],
  approve: ["დაამტკიცა", "დაამტკიცეთ"],
  reject: ["უარყო", "უარყავით"],
  return: ["დააბრუნა", "დააბრუნეთ"],
  updated: ["შეცვალა", "შეცვალეთ"],
  attachment_added: ["დაამატა ფაილი", "დაამატეთ ფაილი"],
  attachment_removed: ["წაშალა ფაილი", "წაშალეთ ფაილი"],
}

const DECISIONS = ["approve", "reject", "return"]

export type ActivityText = { who: string; verb: string; id: string; tail: string; status: string | null }

export function activityText(event: ActivityEvent, meId: number | undefined, officerView: boolean): ActivityText {
  const own = event.actor?.id !== undefined && event.actor.id === meId
  const key = event.action === "submit" && event.from_status === "Returned" ? "resubmit" : event.action
  const [third, second] = VERBS[key] ?? [event.action, event.action]
  const app = event.application
  const amount = app && app.amount > 0 ? money(app.amount) : null

  let tail = ""
  if (event.action === "submit") tail = [" რისკებში", amount].filter(Boolean).join(" · ")
  else if (event.action === "approve") tail = ["", app?.car, amount].filter((x) => x !== null && x !== undefined).join(" · ")
  else if (event.action === "created" && app?.car) tail = ` · ${app.car}`
  else if (event.comment) tail = ` — ${event.comment}`

  return {
    who: own ? "თქვენ" : event.actor ? ergative(event.actor) : "სისტემამ",
    // An officer reads the risk team's decisions on their applications as "… დაამტკიცა თქვენი 001-…".
    verb: own ? second : officerView && DECISIONS.includes(event.action) ? `${third} თქვენი` : third,
    id: app ? shortNo(app.application_no, app.id) : "",
    tail: tail === "" ? "" : tail,
    status: event.to_status ?? app?.status ?? null,
  }
}
