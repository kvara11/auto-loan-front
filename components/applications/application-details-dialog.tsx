"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { type ApplicationRecord } from "@/components/applications/applications-types"
import { AlertCircle, Calendar, Car, ClipboardList, Coins, User, Users } from "lucide-react"

type ApplicationDetailsDialogProps = {
  application: ApplicationRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatDate(value?: string) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("ka-GE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

function formatAmount(value?: number | string) {
  if (value === undefined || value === null || value === "") return "-"
  const amount = typeof value === "string" ? Number(value) : value
  return Number.isNaN(amount) ? String(value) : amount.toLocaleString("en-US", { minimumFractionDigits: 2 })
}

export function ApplicationDetailsDialog({
  application,
  open,
  onOpenChange,
}: ApplicationDetailsDialogProps) {
  if (!application) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <div>
              <DialogTitle className="text-xl">
                განაცხადი #{application.application_no || application.id}
              </DialogTitle>
              <DialogDescription>
                დეტალური ინფორმაცია სესხის განაცხადის შესახებ
              </DialogDescription>
            </div>
            <Badge variant={application.status === "Draft" ? "outline" : "default"} className="h-6">
              {application.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          
          {application.ltv_warning && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-100 text-red-900">
              <AlertCircle className="size-5 shrink-0" />
              <div className="text-sm font-medium">
                {application.ltv_warning}
              </div>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
        
            <section className="space-y-4">
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <Users className="size-4" />
                <h3>კლიენტი და ოფიცერი</h3>
              </div>
              <div className="grid gap-4 p-4 rounded-xl border bg-slate-50/50">
                <div className="grid gap-1">
                  <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">კლიენტი</span>
                  <p className="text-sm font-medium">{application.client.first_name} {application.client.last_name}</p>
                  <p className="text-xs text-muted-foreground">ID: {application.client.id} {application.client.username ? `(@${application.client.username})` : ""}</p>
                </div>
                <div className="grid gap-1">
                  <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">ოფიცერი</span>
                  <p className="text-sm font-medium">{application.officer.first_name} {application.officer.last_name}</p>
                  <p className="text-xs text-muted-foreground">ID: {application.officer.id} (@{application.officer.username})</p>
                </div>
                {application.officer_comment && (
                  <div className="grid gap-1 border-t pt-3">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">ოფიცრის კომენტარი</span>
                    <p className="text-sm italic text-slate-600">"{application.officer_comment}"</p>
                  </div>
                )}
              </div>
            </section>


            <section className="space-y-4">
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <Coins className="size-4" />
                <h3>სესხის დეტალები</h3>
              </div>
              <div className="grid gap-4 p-4 rounded-xl border bg-slate-50/50">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">თანხა</span>
                    <p className="text-sm font-bold">{formatAmount(application.requested_amount)} {application.currency}</p>
                  </div>
                  <div className="grid gap-1">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">ვადა</span>
                    <p className="text-sm font-medium">{application.loan_term_months} თვე</p>
                  </div>
                  <div className="grid gap-1">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">საპროცენტო განაკვეთი</span>
                    <p className="text-sm font-medium">{application.annual_interest_rate}%</p>
                  </div>
                  <div className="grid gap-1">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">გადახდის დღე</span>
                    <p className="text-sm font-medium">{application.payment_day}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t pt-3">
                  <div className="grid gap-1">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">საკომისიო</span>
                    <p className="text-sm font-medium">{formatAmount(application.commission_fee)} {application.commission_fee_type === "percent" ? "%" : application.currency}</p>
                  </div>
                  <div className="grid gap-1">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">თანამონაწილეობა</span>
                    <p className="text-sm font-medium">{formatAmount(application.down_payment)} {application.currency}</p>
                  </div>
                </div>
                {application.loan_purpose && (
                  <div className="grid gap-1 border-t pt-3">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">მიზნობრიობა</span>
                    <p className="text-sm">{application.loan_purpose}</p>
                  </div>
                )}
              </div>
            </section>
            

            <section className="space-y-4">
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <Car className="size-4" />
                <h3>ავტომობილის ინფორმაცია</h3>
              </div>
              <div className="grid gap-4 p-4 rounded-xl border bg-slate-50/50">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">მარკა / მოდელი</span>
                    <p className="text-sm font-medium">{application.car_make_id} / {application.car_model_id}</p>
                  </div>
                  <div className="grid gap-1">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">წელი</span>
                    <p className="text-sm font-medium">{application.car_year}</p>
                  </div>
                  <div className="grid gap-1">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">ძრავი</span>
                    <p className="text-sm font-medium">{application.engine}</p>
                  </div>
                  <div className="grid gap-1">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">გარბენი</span>
                    <p className="text-sm font-medium">{application.mileage_km} კმ</p>
                  </div>
                </div>
                <div className="grid gap-1 border-t pt-3">
                  <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">VIN კოდი</span>
                  <p className="text-sm font-mono">{application.vin}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">სახ. ნომერი</span>
                    <p className="text-sm font-medium">{application.plate_number}</p>
                  </div>
                  <div className="grid gap-1">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">მდგომარეობა</span>
                    <p className="text-sm font-medium">{application.vehicle_condition}</p>
                  </div>
                </div>
                {application.vehicle_comment && (
                  <div className="grid gap-1 border-t pt-3">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">ავტომობილის კომენტარი</span>
                    <p className="text-sm">{application.vehicle_comment}</p>
                  </div>
                )}
              </div>
            </section>
            

            <section className="space-y-4">
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <ClipboardList className="size-4" />
                <h3>შეფასება და რისკები</h3>
              </div>
              <div className="grid gap-4 p-4 rounded-xl border bg-slate-50/50">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">გამყიდველის ფასი</span>
                    <p className="text-sm font-medium">{formatAmount(application.seller_price)} {application.currency}</p>
                  </div>
                  <div className="grid gap-1">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">საბაზრო ფასი</span>
                    <p className="text-sm font-bold text-emerald-700">{formatAmount(application.market_value)} {application.currency}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t pt-3">
                  <div className="grid gap-1">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">LTV</span>
                    <p className={`text-sm font-bold ${application.ltv_warning ? 'text-red-600' : 'text-slate-900'}`}>{application.ltv}%</p>
                  </div>
                  <div className="grid gap-1">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Max LTV</span>
                    <p className="text-sm font-medium">{application.max_ltv}%</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t pt-3">
                  <div className="grid gap-1">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">ანალოგები</span>
                    <p className="text-sm font-medium">{application.comparable_count}</p>
                  </div>
                  <div className="grid gap-1">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">ლიკვიდაციური ფასი</span>
                    <p className="text-sm font-medium">{formatAmount(application.liquidation_value)} {application.currency}</p>
                  </div>
                </div>
              </div>
            </section>


            {application.has_coborrower_guarantor === "1" || application.has_coborrower_guarantor === 1 || application.co_borrower_name || application.guarantor_name ? (
              <section className="space-y-4 md:col-span-2">
                <div className="flex items-center gap-2 font-semibold text-slate-800">
                  <User className="size-4" />
                  <h3>თანამსესხებელი / თავდები</h3>
                </div>
                <div className="grid gap-4 p-4 rounded-xl border bg-slate-50/50 sm:grid-cols-2">
                  <div className="grid gap-1">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">თანამსესხებელი</span>
                    <p className="text-sm font-medium">{application.co_borrower_name || "-"}</p>
                    {application.co_borrower_personal_id && (
                      <p className="text-xs text-muted-foreground">P/N: {application.co_borrower_personal_id}</p>
                    )}
                  </div>
                  <div className="grid gap-1">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">თავდები</span>
                    <p className="text-sm font-medium">{application.guarantor_name || "-"}</p>
                    {application.guarantor_personal_id && (
                      <p className="text-xs text-muted-foreground">P/N: {application.guarantor_personal_id}</p>
                    )}
                  </div>
                </div>
              </section>
            ) : null}


            <section className="space-y-4">
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <Calendar className="size-4" />
                <h3>ისტორია</h3>
              </div>
              <div className="grid gap-4 p-4 rounded-xl border bg-slate-50/50">
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid gap-1">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">შექმნილია</span>
                    <p className="text-sm font-medium">{formatDate(application.created_at)}</p>
                  </div>
                  <div className="grid gap-1">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">განახლებულია</span>
                    <p className="text-sm font-medium">{formatDate(application.updated_at)}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
