"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import type { EffectSettings } from "@/lib/effect-settings"

interface EffectControlsProps {
  settings: EffectSettings
  onChange: (settings: EffectSettings) => void
}

const isValidHex = (hex: string) =>
  /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)

const normalizeHex = (input: string): string | null => {
  let hex = input.trim()
  if (!hex.startsWith("#")) {
    hex = "#" + hex
  }
  if (isValidHex(hex)) {
    return hex.toUpperCase()
  }
  return null
}

const toSliderNumber = (value: number | readonly number[]) =>
  typeof value === "number" ? value : (value[0] ?? 0)

function ColorSwatch({
  value,
  onChange,
  "aria-label": ariaLabel,
}: {
  value: string
  onChange: (value: string) => void
  "aria-label": string
}) {
  return (
    <label className="relative size-9 shrink-0 cursor-pointer overflow-hidden rounded-md border border-input shadow-xs">
      <span
        aria-hidden
        className="absolute inset-0 rounded-[calc(var(--radius-md)-1px)]"
        style={{ backgroundColor: value }}
      />
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        aria-label={ariaLabel}
        className="absolute inset-0 size-full cursor-pointer opacity-0"
      />
    </label>
  )
}

function SettingRow({
  label,
  valueLabel,
  children,
}: {
  label: string
  valueLabel: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <Label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </Label>
        <span className="font-mono text-xs text-foreground/70 tabular-nums">
          {valueLabel}
        </span>
      </div>
      {children}
    </div>
  )
}

export function EffectControls({ settings, onChange }: EffectControlsProps) {
  const updateSetting = <K extends keyof EffectSettings>(
    key: K,
    value: EffectSettings[K]
  ) => {
    onChange({ ...settings, [key]: value })
  }

  const handleColorInput = (
    key: "foregroundColor" | "backgroundColor",
    value: string
  ) => {
    const normalized = normalizeHex(value)
    if (normalized) {
      updateSetting(key, normalized)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="fg-color"
            className="text-xs font-medium tracking-wide text-muted-foreground uppercase"
          >
            Foreground
          </Label>
          <div className="flex items-center gap-2">
            <ColorSwatch
              value={settings.foregroundColor}
              onChange={(value) => updateSetting("foregroundColor", value)}
              aria-label="Foreground color picker"
            />
            <Input
              id="fg-color"
              type="text"
              value={settings.foregroundColor}
              onChange={(e) =>
                handleColorInput("foregroundColor", e.target.value)
              }
              placeholder="#FF6B35"
              className="h-9 font-mono text-xs uppercase"
              maxLength={7}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="bg-color"
            className="text-xs font-medium tracking-wide text-muted-foreground uppercase"
          >
            Background
          </Label>
          <div className="flex items-center gap-2">
            <ColorSwatch
              value={settings.backgroundColor}
              onChange={(value) => updateSetting("backgroundColor", value)}
              aria-label="Background color picker"
            />
            <Input
              id="bg-color"
              type="text"
              value={settings.backgroundColor}
              onChange={(e) =>
                handleColorInput("backgroundColor", e.target.value)
              }
              placeholder="#8B2500"
              className="h-9 font-mono text-xs uppercase"
              maxLength={7}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-5">
        <SettingRow label="Line Frequency" valueLabel={`${settings.lineFrequency}`}>
          <Slider
            value={settings.lineFrequency}
            onValueChange={(v) =>
              updateSetting("lineFrequency", toSliderNumber(v))
            }
            min={1}
            max={10}
            step={0.5}
          />
        </SettingRow>

        <SettingRow
          label="Line Thickness"
          valueLabel={`${settings.lineThickness}px`}
        >
          <Slider
            value={settings.lineThickness}
            onValueChange={(v) =>
              updateSetting("lineThickness", toSliderNumber(v))
            }
            min={2}
            max={40}
            step={1}
          />
        </SettingRow>

        <SettingRow
          label="Wave Amplitude"
          valueLabel={settings.waveAmplitude.toFixed(1)}
        >
          <Slider
            value={settings.waveAmplitude}
            onValueChange={(v) =>
              updateSetting("waveAmplitude", toSliderNumber(v))
            }
            min={0.5}
            max={4}
            step={0.1}
          />
        </SettingRow>

        <SettingRow label="Contrast" valueLabel={settings.contrast.toFixed(1)}>
          <Slider
            value={settings.contrast}
            onValueChange={(v) => updateSetting("contrast", toSliderNumber(v))}
            min={0.5}
            max={2}
            step={0.1}
          />
        </SettingRow>

        <SettingRow label="Brightness" valueLabel={`${settings.brightness}`}>
          <Slider
            value={settings.brightness}
            onValueChange={(v) =>
              updateSetting("brightness", toSliderNumber(v))
            }
            min={-50}
            max={50}
            step={1}
          />
        </SettingRow>
      </div>
    </div>
  )
}
