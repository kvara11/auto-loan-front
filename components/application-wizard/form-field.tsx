"use client"

import { type ReactNode } from "react"

import { type CardProps, type WizardForm } from "@/components/application-wizard/wizard-form"
import { type Option } from "@/components/application-wizard/wizard-options"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

type StringField = { [K in keyof WizardForm]: WizardForm[K] extends string ? K : never }[keyof WizardForm]
type BooleanField = { [K in keyof WizardForm]: WizardForm[K] extends boolean ? K : never }[keyof WizardForm]

type FieldProps = { id: string; label: string; required?: boolean; error?: string; className?: string; children: ReactNode }

// Label + control + error message (the control gets aria-invalid for the red border).
export function Field({ id, label, required, error, className, children }: FieldProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <Label htmlFor={id}>
        {label}
        {required ? <span className="text-destructive">*</span> : null}
      </Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}

type InputProps = CardProps & {
  name: StringField
  label: string
  required?: boolean
  className?: string
} & Omit<React.ComponentProps<"input">, "name" | "value" | "onChange" | "form">

// A text/number input bound to one form field. Numbers are text inputs with inputMode so
// "24,500" can be typed; toNumber() cleans them for the payload.
export function FormInput({ form, errors, set, name, label, required, className, ...input }: InputProps) {
  return (
    <Field id={name} label={label} required={required} error={errors[name]} className={className}>
      <Input
        id={name}
        className="h-10"
        value={form[name]}
        onChange={(event) => set(name, event.target.value)}
        aria-invalid={Boolean(errors[name])}
        {...input}
      />
    </Field>
  )
}

type SelectProps = CardProps & {
  name: StringField
  label: string
  options: Option[]
  required?: boolean
  placeholder?: string
  className?: string
}

export function FormSelect({ form, errors, set, name, label, options, required, placeholder = "აირჩიეთ", className }: SelectProps) {
  return (
    <Field id={name} label={label} required={required} error={errors[name]} className={className}>
      <Select value={form[name] || undefined} onValueChange={(value) => set(name, value)}>
        <SelectTrigger id={name} className="h-10 w-full" aria-invalid={Boolean(errors[name])}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}

export function FormCheckbox({ form, set, name, label }: CardProps & { name: BooleanField; label: string }) {
  return (
    <label htmlFor={name} className="flex min-h-10 cursor-pointer items-center gap-2.5 text-sm font-medium">
      <Checkbox id={name} checked={form[name]} onChange={(event) => set(name, event.target.checked)} />
      {label}
    </label>
  )
}
