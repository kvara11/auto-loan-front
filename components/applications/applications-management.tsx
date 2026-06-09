"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { api, getApiErrorMessage } from "@/lib/axios"
import { type ApplicationRecord } from "@/components/applications/applications-types"
import { ApplicationsTable } from "@/components/applications/applications-table"
import { ApplicationDetailsDialog } from "@/components/applications/application-details-dialog"

export function ApplicationsManagement() {
  const [applications, setApplications] = useState<ApplicationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | undefined>()
  const [selectedApplication, setSelectedApplication] = useState<ApplicationRecord | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  useEffect(() => {
    let active = true

    const loadApplications = async () => {
      try {
        const response = await api.get<{ data?: { applications?: ApplicationRecord[] } | ApplicationRecord[] }>("/api/applications")

        if (!active) return

        if (!response.success) {
          setError(response.message || "განაცხადების ჩატვირთვა ვერ მოხერხდა")
          setApplications([])
          return
        }

        // Handle different API response structures based on the provided sample
        let records: ApplicationRecord[] = []
        if (response.data) {
          if (Array.isArray(response.data)) {
            records = response.data
          } else if (response.data.applications) {
            records = response.data.applications
          }
        }

        setApplications(records)
        setError(undefined)
      } catch (requestError) {
        if (!active) return

        setError(getApiErrorMessage(requestError) || "განაცხადების ჩატვირთვა ვერ მოხერხდა")
        setApplications([])
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadApplications()

    return () => {
      active = false
    }
  }, [])

  const handleViewDetails = (application: ApplicationRecord) => {
    setSelectedApplication(application)
    setDetailsOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button asChild type="button" className="h-10">
          <Link href="/dashboard/applications/new">
            <Plus className="size-4" />
            ახალი განაცხადი
          </Link>
        </Button>
      </div>

      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="p-0">
          {error ? (
            <div className="rounded-xl border border-dashed px-6 py-10 text-center bg-white shadow-sm">
              <p className="text-base font-medium sm:text-lg text-red-600">შეცდომა</p>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base">{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                თავიდან ცდა
              </Button>
            </div>
          ) : (
            <ApplicationsTable 
              applications={applications} 
              loading={loading} 
              onView={handleViewDetails}
            />
          )}
        </CardContent>
      </Card>

      <ApplicationDetailsDialog
        application={selectedApplication}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </div>
  )
}