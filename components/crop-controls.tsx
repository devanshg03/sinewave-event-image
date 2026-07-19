"use client"

import { Button } from "@/components/ui/button"
import { ASPECT_OPTIONS } from "@/lib/crop-aspects"
import { cn } from "@/lib/utils"

interface CropControlsProps {
  aspectId: string
  onAspectChange: (aspectId: string) => void
  isCropping: boolean
  canReset: boolean
  disabled?: boolean
  onStartCrop: () => void
  onCancelCrop: () => void
  onApplyCrop: () => void
  onReset: () => void
  applying?: boolean
}

export function CropControls({
  aspectId,
  onAspectChange,
  isCropping,
  canReset,
  disabled = false,
  onStartCrop,
  onCancelCrop,
  onApplyCrop,
  onReset,
  applying = false,
}: CropControlsProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {ASPECT_OPTIONS.map((option) => {
          const isActive = aspectId === option.id
          return (
            <button
              key={option.id}
              type="button"
              disabled={disabled}
              onClick={() => onAspectChange(option.id)}
              className={cn(
                "h-8 rounded-md px-2.5 text-xs font-medium transition-colors",
                "border border-input hover:bg-muted disabled:pointer-events-none disabled:opacity-50",
                isActive && "border-primary bg-muted text-foreground"
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>

      {isCropping ? (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onCancelCrop}
            disabled={applying}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={onApplyCrop}
            disabled={applying}
          >
            {applying ? "Applying…" : "Apply Crop"}
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onStartCrop}
            disabled={disabled}
          >
            Crop
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            onClick={onReset}
            disabled={disabled || !canReset}
          >
            Reset
          </Button>
        </div>
      )}
    </div>
  )
}
