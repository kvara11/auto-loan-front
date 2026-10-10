"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { useClientStep } from "@/components/application-wizard/use-client-step"
import { CLIENT_FIELDS, DEFAULT_FORM, type SetField, type WizardErrors, type WizardForm } from "@/components/application-wizard/wizard-form"
import { fromApplication, toApplicationPayload } from "@/components/application-wizard/wizard-payload"
import { clientErrors, mapServerErrors, submitErrors } from "@/components/application-wizard/wizard-validation"
import { fetchApplication, performAction, saveApplication } from "@/lib/applications"
import { getApiErrorMessage, getApiFieldErrors } from "@/lib/axios"

const PERSONAL_ID = /^\d{11}$/

export type WizardState = ReturnType<typeof useApplicationWizard>

// The new/edit application wizard: step 1 client, step 2 loan + vehicle; "მონახაზად შენახვა"
// saves a Draft (partial is fine), "გაგზავნა რისკებში" saves and submits (T-402, T-409).
export function useApplicationWizard(applicationId?: string) {
  const router = useRouter()
  const client = useClientStep()
  const [form, setForm] = useState<WizardForm>(DEFAULT_FORM)
  const [errors, setErrors] = useState<WizardErrors>({})
  const [step, setStep] = useState<1 | 2>(1)
  const [appId, setAppId] = useState<number | null>(null)
  const [applicationNo, setApplicationNo] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string>()
  const [loading, setLoading] = useState(Boolean(applicationId))
  const [banner, setBanner] = useState<string>()
  const [saving, setSaving] = useState<"next" | "draft" | "submit" | null>(null)

  // Edit mode: prefill from the application; only the officer's own Draft/Returned is editable.
  useEffect(() => {
    if (!applicationId) return
    let active = true

    fetchApplication(applicationId)
      .then(({ application, can_edit }) => {
        if (!active) return
        if (!can_edit) {
          setLoadError("ამ განაცხადის რედაქტირება ახლა შეუძლებელია: მხოლოდ საკუთარი მონახაზი ან დაბრუნებული განაცხადი რედაქტირდება.")
          return
        }
        const prefilled = fromApplication(application)
        setForm(prefilled)
        setAppId(application.id)
        setApplicationNo(application.application_no)
        client.adopt(prefilled, application.client.id)
      })
      .catch((err) => active && setLoadError(getApiErrorMessage(err)))
      .finally(() => active && setLoading(false))

    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per id
  }, [applicationId])

  const set: SetField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))

    // Typing the 11th digit looks the client up (new applications only).
    if (field === "personal_id" && typeof value === "string" && PERSONAL_ID.test(value) && client.status === "idle") {
      void lookup(value)
    }
  }

  const lookup = async (personalId = form.personal_id) => {
    const found = await client.lookup(personalId)
    if (!found) return
    setForm((current) => {
      const merged = { ...current, ...found }
      client.remember(merged)
      return merged
    })
  }

  // "სხვა კლიენტი": clears the client fields and starts a new lookup.
  const resetClient = () => {
    client.reset()
    setForm((current) => ({ ...current, ...Object.fromEntries(CLIENT_FIELDS.map((field) => [field, DEFAULT_FORM[field]])) }))
    setErrors({})
  }

  const fail = (err: unknown) => {
    const fieldErrors = mapServerErrors(getApiFieldErrors(err))
    setErrors(fieldErrors)
    setBanner(getApiErrorMessage(err))
  }

  // Saves the client (step 1); returns false when step 1 isn't valid.
  const saveClientStep = async () => {
    const found = clientErrors(form)
    if (Object.keys(found).length) {
      setErrors(found)
      setStep(1)
      return null
    }
    return client.save(form)
  }

  const run = async (kind: "next" | "draft" | "submit", work: () => Promise<void>) => {
    setSaving(kind)
    setBanner(undefined)
    try {
      await work()
    } catch (err) {
      fail(err)
    } finally {
      setSaving(null)
    }
  }

  const next = () => run("next", async () => {
    if (await saveClientStep()) setStep(2)
  })

  const persist = async () => {
    const clientId = await saveClientStep()
    if (!clientId) return null
    const saved = await saveApplication(appId, { ...toApplicationPayload(form), client_id: clientId })
    setAppId(saved.id)
    return saved.id
  }

  const saveDraft = () => run("draft", async () => {
    const id = await persist()
    if (id) router.push(`/dashboard/applications/${id}`)
  })

  const submit = () => run("submit", async () => {
    const missing = { ...clientErrors(form), ...submitErrors(form) }
    if (Object.keys(missing).length) {
      setErrors(missing)
      setBanner("შეავსეთ მონიშნული ველები რისკებში გაგზავნამდე.")
      return
    }
    const id = await persist()
    if (!id) return
    await performAction(id, "submit")
    router.push(`/dashboard/applications/${id}`)
  })

  return {
    form, errors, set, step, setStep, client, lookup, resetClient, next, saveDraft, submit,
    saving, banner, loading, loadError, isEdit: Boolean(applicationId), applicationNo,
  }
}
