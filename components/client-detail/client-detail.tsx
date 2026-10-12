"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import { ClientApplications } from "@/components/client-detail/client-applications"
import { ClientEditDialog } from "@/components/client-detail/client-edit-dialog"
import { ClientHeader } from "@/components/client-detail/client-header"
import { ClientProfileCard } from "@/components/client-detail/client-profile-card"
import { FormNotice } from "@/components/settings/settings-section"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthUser } from "@/lib/auth-storage"
import { clientsErrorMessage, fetchClient, hasPermission, type Client } from "@/lib/clients"

// A registry client: profile, their applications (within the viewer's scope) and editing (clients.update).
export function ClientDetail({ id }: { id: string }) {
  const [client, setClient] = useState<Client | null>(null)
  const [error, setError] = useState<string>()
  const [notice, setNotice] = useState<string>()
  const [editing, setEditing] = useState(false)
  // UX only: the backend enforces both permissions.
  const permissions = useAuthUser()?.permissions
  const canEdit = hasPermission(permissions, "clients.update")
  const canCreate = hasPermission(permissions, "applications.create")

  useEffect(() => {
    let active = true

    fetchClient(id)
      .then((data) => active && setClient(data))
      .catch((err) => active && setError(clientsErrorMessage(err, "კლიენტი ვერ მოიძებნა")))

    return () => {
      active = false
    }
  }, [id])

  if (error) {
    return (
      <div className="flex min-h-65 flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-card px-6 text-center">
        <p className="text-base font-medium">{error}</p>
        <Button asChild variant="outline" className="h-10">
          <Link href="/dashboard/clients">კლიენტების სია</Link>
        </Button>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="flex flex-col gap-5" aria-busy="true">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-[260px] rounded-xl" />
        <Skeleton className="h-[260px] rounded-xl" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <ClientHeader
        client={client}
        canEdit={canEdit}
        canCreate={canCreate}
        onEdit={() => {
          setNotice(undefined)
          setEditing(true)
        }}
      />
      {notice ? <FormNotice tone="success">{notice}</FormNotice> : null}
      <ClientProfileCard client={client} />
      <ClientApplications clientId={client.id} />

      {canEdit && editing ? (
        <ClientEditDialog
          open
          client={client}
          onOpenChange={setEditing}
          onSaved={(saved, message) => {
            setClient(saved)
            setNotice(message)
            setEditing(false)
          }}
        />
      ) : null}
    </div>
  )
}
