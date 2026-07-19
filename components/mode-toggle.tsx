"use client"

import { cn } from "@/lib/utils"

export type EditorMode = "image" | "backdrop"

interface ModeToggleProps {
  mode: EditorMode
  onModeChange: (mode: EditorMode) => void
  backdropDisabled?: boolean
}

export function ModeToggle({
  mode,
  onModeChange,
  backdropDisabled = false,
}: ModeToggleProps) {
  return (
    <div className="inline-flex h-8 items-center rounded-lg bg-muted p-0.5">
      <button
        type="button"
        onClick={() => onModeChange("image")}
        className={cn(
          "h-7 rounded-md px-3 text-xs font-medium transition-colors",
          mode === "image"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Image
      </button>
      <button
        type="button"
        onClick={() => onModeChange("backdrop")}
        disabled={backdropDisabled}
        className={cn(
          "h-7 rounded-md px-3 text-xs font-medium transition-colors",
          "disabled:pointer-events-none disabled:opacity-40",
          mode === "backdrop"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Backdrop
      </button>
    </div>
  )
}
