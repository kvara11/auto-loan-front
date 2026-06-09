import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ApplicationFormPage } from "@/components/applications/application-form"

export default function NewApplicationPage() {
  return (
    <DashboardShell>
      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-bold tracking-tight sm:text-2xl text-slate-800">ახალი განაცხადი</h3>
            <p className="text-muted-foreground text-sm sm:text-base">შექმენით ახალი სასესხო განაცხადი და გამოიყენეთ პირადი ნომერი მონაცემების ავტომატური შევსებისთვის.</p>
          </div>

          <Link href="/dashboard/applications">
            <Button variant="outline" size="sm" className="w-fit">
              <ArrowLeft className="mr-2 size-4" />
              უკან დაბრუნება
            </Button>
          </Link>
        </div>

        <ApplicationFormPage />
      </section>
    </DashboardShell>
  )
}