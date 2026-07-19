"use client"

import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"

interface EffectSettings {
  foregroundColor: string
  backgroundColor: string
  lineFrequency: number
  lineThickness: number
  waveAmplitude: number
  contrast: number
  brightness: number
}

interface EffectControlsProps {
  settings: EffectSettings
  onChange: (settings: EffectSettings) => void
}

const isValidHex = (hex: string) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)

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
    <div className="bg-zinc-900 rounded-lg p-4 space-y-6">
      <h3 className="text-sm font-medium text-zinc-300">Effect Settings</h3>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fg-color" className="text-xs text-zinc-400">
              Foreground Color
            </Label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={settings.foregroundColor}
                onChange={(e) => updateSetting("foregroundColor", e.target.value.toUpperCase())}
                className="w-10 h-10 rounded-md border border-zinc-700 shrink-0 cursor-pointer bg-transparent p-0"
              />
              <Input
                id="fg-color"
                type="text"
                value={settings.foregroundColor}
                onChange={(e) => handleColorInput("foregroundColor", e.target.value)}
                placeholder="#FF6B35"
                className="h-10 font-mono text-sm uppercase"
                maxLength={7}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bg-color" className="text-xs text-zinc-400">
              Background Color
            </Label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={settings.backgroundColor}
                onChange={(e) => updateSetting("backgroundColor", e.target.value.toUpperCase())}
                className="w-10 h-10 rounded-md border border-zinc-700 shrink-0 cursor-pointer bg-transparent p-0"
              />
              <Input
                id="bg-color"
                type="text"
                value={settings.backgroundColor}
                onChange={(e) => handleColorInput("backgroundColor", e.target.value)}
                placeholder="#8B2500"
                className="h-10 font-mono text-sm uppercase"
                maxLength={7}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-xs text-zinc-400">Line Frequency</Label>
            <span className="text-xs text-zinc-500">{settings.lineFrequency}</span>
          </div>
          <Slider
            value={[settings.lineFrequency]}
            onValueChange={([v]) => updateSetting("lineFrequency", v)}
            min={1}
            max={10}
            step={0.5}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-xs text-zinc-400">Line Thickness</Label>
            <span className="text-xs text-zinc-500">{settings.lineThickness}px</span>
          </div>
          <Slider
            value={[settings.lineThickness]}
            onValueChange={([v]) => updateSetting("lineThickness", v)}
            min={2}
            max={40}
            step={1}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-xs text-zinc-400">Wave Amplitude</Label>
            <span className="text-xs text-zinc-500">{settings.waveAmplitude.toFixed(1)}</span>
          </div>
          <Slider
            value={[settings.waveAmplitude]}
            onValueChange={([v]) => updateSetting("waveAmplitude", v)}
            min={0.5}
            max={4}
            step={0.1}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-xs text-zinc-400">Contrast</Label>
            <span className="text-xs text-zinc-500">{settings.contrast.toFixed(1)}</span>
          </div>
          <Slider
            value={[settings.contrast]}
            onValueChange={([v]) => updateSetting("contrast", v)}
            min={0.5}
            max={2}
            step={0.1}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-xs text-zinc-400">Brightness</Label>
            <span className="text-xs text-zinc-500">{settings.brightness}</span>
          </div>
          <Slider
            value={[settings.brightness]}
            onValueChange={([v]) => updateSetting("brightness", v)}
            min={-50}
            max={50}
            step={1}
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}
