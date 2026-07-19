"use client"

import { useCallback, useState } from "react"
import { Upload, ImageIcon } from "lucide-react"

interface ImageUploaderProps {
  onImageSelect: (imageDataUrl: string) => void
}

export function ImageUploader({ onImageSelect }: ImageUploaderProps) {
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
      className={`
        relative aspect-[4/5] max-h-[600px] rounded-lg border-2 border-dashed transition-colors
        flex flex-col items-center justify-center gap-4 cursor-pointer
        ${
          isDragging
            ? "border-orange-500 bg-orange-500/10"
            : "border-zinc-700 bg-zinc-900 hover:border-zinc-500 hover:bg-zinc-800/50"
        }
      `}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
      <div
        className={`p-4 rounded-full transition-colors ${
          isDragging ? "bg-orange-500/20" : "bg-zinc-800"
        }`}
      >
        {isDragging ? (
          <Upload className="w-8 h-8 text-orange-500" />
        ) : (
          <ImageIcon className="w-8 h-8 text-zinc-400" />
        )}
      </div>
      <div className="text-center">
        <p className="text-zinc-300 font-medium">
          {isDragging ? "Drop your image here" : "Drag and drop an image"}
        </p>
        <p className="text-zinc-500 text-sm mt-1">or click to browse</p>
      </div>
      <p className="text-zinc-600 text-xs">Supports JPG, PNG, WebP</p>
    </div>
  )
}
