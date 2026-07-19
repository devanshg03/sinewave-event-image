"use client"

import { useCallback, useState } from "react"
import Cropper, { type Area } from "react-easy-crop"

import type { CropArea } from "@/lib/crop-image"

interface ImageCropperProps {
  image: string
  aspect?: number
  onCropAreaChange: (area: CropArea | null) => void
}

export function ImageCropper({
  image,
  aspect,
  onCropAreaChange,
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)

  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      onCropAreaChange(croppedAreaPixels)
    },
    [onCropAreaChange]
  )

  return (
    <div className="relative size-full overflow-hidden">
      <Cropper
        image={image}
        crop={crop}
        zoom={zoom}
        aspect={aspect}
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onCropComplete={onCropComplete}
        objectFit="contain"
        showGrid
        style={{
          containerStyle: { backgroundColor: "transparent" },
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-3">
        <div className="pointer-events-auto w-full max-w-xs rounded-lg border border-border bg-card/90 px-3 py-2 shadow-lg backdrop-blur-sm">
          <label className="mb-1 block text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            Zoom
          </label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-primary"
            aria-label="Zoom"
          />
        </div>
      </div>
    </div>
  )
}
