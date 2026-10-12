"use client"

import { useState } from "react"

import { ClientFields } from "@/components/application-wizard/client-fields"
import { DEFAULT_FORM, type SetField, type WizardErrors, type WizardForm } from "@/components/application-wizard/wizard-form"
import { clientFormFields, toClientPayload } from "@/components/application-wizard/wizard-payload"
import { clientErrors, mapServerErrors } from "@/components/application-wizard/wizard-validation"
import { FormNotice } from "@/components/settings/settings-section"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getApiErrorMessage, getApiFieldErrors } from "@/lib/axios"
import { updateClient, type Client } from "@/lib/clients"

type ClientEditDialogProps = {
  open: boolean
  client: Client
  onOpenChange: (open: boolean) => void
  onSaved: (client: Client, message: string) => void
}

const toForm = (client: Client): WizardForm => ({ ...DEFAULT_FORM, ...clientFormFields(client) })

// The same fields as the wizard's client step; the personal ID never changes (Q-17).
// Mounted only while open, so every opening starts from the saved client.
export function ClientEditDialog({ open, client, onOpenChange, onSaved }: ClientEditDialogProps) {
  const [form, setForm] = useState(() => toForm(client))
  const [errors, setErrors] = useState<WizardErrors>({})
  const [banner, setBanner] = useState<string>()
  const [saving, setSaving] = useState(false)

  const set: SetField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const save = async () => {
    // The personal ID is read-only here (older registry IDs may not be 11 digits).
    const found = clientErrors(form)
    delete found.personal_id
    if (Object.values(found).some(Boolean)) {
      setErrors(found)
      return
    }

    setSaving(true)
    setBanner(undefined)
    try {
      const { client: saved, message } = await updateClient(client.id, toClientPayload(form))
      onSaved(saved, message)
    } catch (err) {
      setErrors(mapServerErrors(getApiFieldErrors(err)))
      setBanner(getApiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>კლიენტის რედაქტირება</DialogTitle>
          <DialogDescription className="tabular-nums">პირადი ნომერი: {client.personal_id} (არ იცვლება)</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
          <ClientFields form={form} errors={errors} set={set} />
        </div>
        {banner ? <FormNotice tone="error">{banner}</FormNotice> : null}

        <DialogFooter>
          <Button type="button" variant="outline" className="h-10" onClick={() => onOpenChange(false)}>
            გაუქმება
          </Button>
          <Button type="button" className="h-10" disabled={saving} onClick={() => void save()}>
            {saving ? "ინახება..." : "შენახვა"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
