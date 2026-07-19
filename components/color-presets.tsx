"use client"

import { Dices } from "lucide-react"

import { Button } from "@/components/ui/button"
import { COLOR_PRESETS, randomContrastColorPair } from "@/lib/effect-settings"
import { cn } from "@/lib/utils"

interface ColorPresetsProps {
  foregroundColor: string
  backgroundColor: string
  onSelect: (fg: string, bg: string) => void
}

export function ColorPresets({
  foregroundColor,
  backgroundColor,
  onSelect,
}: ColorPresetsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {COLOR_PRESETS.map((preset) => {
        const isActive =
          foregroundColor.toLowerCase() === preset.fg.toLowerCase() &&
          backgroundColor.toLowerCase() === preset.bg.toLowerCase()

        return (
          <button
            key={preset.name}
            type="button"
            onClick={() => onSelect(preset.fg, preset.bg)}
            className={cn(
              "size-8 rounded-full transition-transform duration-150",
              "ring-1 ring-foreground/15 hover:scale-105",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              isActive &&
                "scale-105 ring-2 ring-primary ring-offset-2 ring-offset-card"
            )}
            style={{
              background: `linear-gradient(135deg, ${preset.fg} 50%, ${preset.bg} 50%)`,
            }}
            aria-label={`${preset.name} color preset`}
            aria-pressed={isActive}
            title={preset.name}
          />
        )
      })}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 rounded-full px-2.5 text-xs"
        onClick={() => {
          const pair = randomContrastColorPair()
          onSelect(pair.foregroundColor, pair.backgroundColor)
        }}
        title="Random colors with WCAG contrast ≥ 4.5:1"
      >
        <Dices className="size-3.5" aria-hidden />
        Random
      </Button>
    </div>
  )
}
