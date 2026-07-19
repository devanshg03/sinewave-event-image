"use client"

import { useCallback, useState } from "react"
import { ImageIcon, Upload } from "lucide-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { cn } from "@/lib/utils"

interface ImageUploaderProps {
  onImageSelect: (imageDataUrl: string) => void
  className?: string
}

export function ImageUploader({
  onImageSelect,
  className,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        onImageSelect(result)
      }
      reader.readAsDataURL(file)
    },
    [onImageSelect]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        "relative flex cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed transition-colors duration-200",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-border/80 bg-background/40 hover:border-foreground/25 hover:bg-background/60",
        className
      )}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="absolute inset-0 z-10 cursor-pointer opacity-0"
        aria-label="Upload an image"
      />

      <Empty className="relative z-1 border-0 p-8">
        <EmptyHeader>
          <EmptyMedia
            variant="icon"
            className={cn(
              "size-12 rounded-xl transition-colors duration-200",
              isDragging
                ? "bg-primary/15 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            {isDragging ? (
              <Upload className="size-6" />
            ) : (
              <ImageIcon className="size-6" />
            )}
          </EmptyMedia>
          <EmptyTitle className="text-base tracking-tight">
            {isDragging ? "Drop image" : "Drop image here"}
          </EmptyTitle>
          <EmptyDescription>or click to open a file</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}
