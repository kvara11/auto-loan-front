"use client"

import { useRef, useState } from "react"
import { Loader2, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ATTACHMENT_ACCEPT, ATTACHMENT_MAX_BYTES, uploadAttachment } from "@/lib/attachments"
import { getApiErrorMessage } from "@/lib/axios"

type AttachmentUploadProps = {
  applicationId: number
  categories: Record<string, string>
  onUploaded: () => void
  onError: (message: string) => void
}

// Pick a type, then one or more files; they upload one by one with a progress percentage.
export function AttachmentUpload({ applicationId, categories, onUploaded, onError }: AttachmentUploadProps) {
  const input = useRef<HTMLInputElement>(null)
  const [category, setCategory] = useState("vehicle_photo")
  const [progress, setProgress] = useState<string | null>(null)

  const upload = async (files: FileList | null) => {
    if (!files?.length) return
    const list = Array.from(files)

    for (const [index, file] of list.entries()) {
      if (file.size > ATTACHMENT_MAX_BYTES) {
        onError(`„${file.name}“ აღემატება 20 MB-ს.`)
        continue
      }
      try {
        await uploadAttachment(applicationId, file, category, (percent) => setProgress(`${index + 1}/${list.length} · ${percent}%`))
      } catch (err) {
        onError(`„${file.name}“: ${getApiErrorMessage(err)}`)
      }
    }

    setProgress(null)
    if (input.current) input.current.value = ""
    onUploaded()
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-dashed p-3 sm:flex-row sm:items-center">
      <Select value={category} onValueChange={setCategory} disabled={progress !== null}>
        <SelectTrigger className="h-10 sm:w-56" aria-label="ფაილის ტიპი">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(categories).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
        </SelectContent>
      </Select>
      <input ref={input} type="file" multiple accept={ATTACHMENT_ACCEPT} className="hidden" onChange={(event) => void upload(event.target.files)} />
      <Button type="button" className="h-10" onClick={() => input.current?.click()} disabled={progress !== null}>
        {progress !== null ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
        {progress ?? "ფაილის ატვირთვა"}
      </Button>
      <span className="text-xs text-muted-foreground">JPG, PNG, WEBP, HEIC, PDF · მაქს. 20 MB</span>
    </div>
  )
}
