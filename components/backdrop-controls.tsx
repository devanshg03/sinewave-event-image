"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { BackdropCopy } from "@/lib/backdrop"

interface BackdropControlsProps {
  copy: BackdropCopy
  onChange: (copy: BackdropCopy) => void
  disabled?: boolean
}

function Field({
  id,
  label,
  value,
  disabled,
  onChange,
}: {
  id: string
  label: string
  value: string
  disabled?: boolean
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={id}
        className="text-xs font-medium tracking-wide text-muted-foreground uppercase"
      >
        {label}
      </Label>
      <Input
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="h-9"
      />
    </div>
  )
}

export function BackdropControls({
  copy,
  onChange,
  disabled = false,
}: BackdropControlsProps) {
  const update = <K extends keyof BackdropCopy>(key: K, value: BackdropCopy[K]) => {
    onChange({ ...copy, [key]: value })
  }

  return (
    <div className="space-y-3">
      <Field
        id="backdrop-headline"
        label="Headline"
        value={copy.headline}
        disabled={disabled}
        onChange={(value) => update("headline", value)}
      />
      <Field
        id="backdrop-subhead"
        label="Subhead"
        value={copy.subhead}
        disabled={disabled}
        onChange={(value) => update("subhead", value)}
      />
      <Field
        id="backdrop-image-title"
        label="Name"
        value={copy.imageTitle}
        disabled={disabled}
        onChange={(value) => update("imageTitle", value)}
      />
      <Field
        id="backdrop-image-subtitle"
        label="Role"
        value={copy.imageSubtitle}
        disabled={disabled}
        onChange={(value) => update("imageSubtitle", value)}
      />
    </div>
  )
}
