"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { ImageUploader } from "@/components/image-uploader"
import { EffectControls } from "@/components/effect-controls"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export default function SineWaveImageProcessor() {
  const [image, setImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [settings, setSettings] = useState({
    foregroundColor: "#ff6b35",
    backgroundColor: "#8b2500",
    lineFrequency: 6,
    lineThickness: 2,
    waveAmplitude: 1.0,
    contrast: 1.5,
    brightness: 0,
  })

  const processImage = useCallback(() => {
    if (!image || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      const maxSize = 800
      let width = img.width
      let height = img.height
      
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = (height / width) * maxSize
          width = maxSize
        } else {
          width = (width / height) * maxSize
          height = maxSize
        }
      }

      canvas.width = width
      canvas.height = height

      // Draw original image
      ctx.drawImage(img, 0, 0, width, height)

      // Get image data
      const imageData = ctx.getImageData(0, 0, width, height)
      const data = imageData.data

      // Parse colors
      const fgColor = hexToRgb(settings.foregroundColor)
      const bgColor = hexToRgb(settings.backgroundColor)

      // First pass: convert to grayscale with contrast/brightness
      const grayscale = new Float32Array(width * height)
      for (let i = 0; i < width * height; i++) {
        const idx = i * 4
        let gray = (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114) / 255
        // Apply contrast and brightness
        gray = ((gray - 0.5) * settings.contrast) + 0.5 + settings.brightness / 100
        grayscale[i] = Math.max(0, Math.min(1, gray))
      }

      // Create output image data for pixel-level control
      const outputData = ctx.createImageData(width, height)
      
      // Parse colors
      const fgR = fgColor.r, fgG = fgColor.g, fgB = fgColor.b
      const bgR = bgColor.r, bgG = bgColor.g, bgB = bgColor.b
      
      // Line parameters - lineThickness sets how many pixels each band spans
      const lineSpacing = Math.max(2, settings.lineThickness)
      const waveFrequency = 0.02 * settings.lineFrequency
      const waveAmplitude = settings.waveAmplitude * 0.3

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4
          const brightness = grayscale[y * width + x]
          
          // Calculate sine wave pattern
          const waveOffset = Math.sin(x * waveFrequency) * waveAmplitude
          const yInLine = ((y + waveOffset) % lineSpacing) / lineSpacing
          
          // Create scan line effect - thin dark lines at regular intervals
          // The line appears in the middle portion of each spacing
          const scanLineIntensity = yInLine < 0.5 ? 1.0 : 0.4
          
          // Map brightness to color: dark areas -> bg color, light areas -> fg color
          // This creates the duotone effect
          const colorBlend = brightness
          
          // Base color from duotone mapping
          let r = bgR + (fgR - bgR) * colorBlend
          let g = bgG + (fgG - bgG) * colorBlend
          let b = bgB + (fgB - bgB) * colorBlend
          
          // Apply scan line darkening
          r *= scanLineIntensity
          g *= scanLineIntensity
          b *= scanLineIntensity
          
          outputData.data[idx] = Math.round(Math.min(255, r))
          outputData.data[idx + 1] = Math.round(Math.min(255, g))
          outputData.data[idx + 2] = Math.round(Math.min(255, b))
          outputData.data[idx + 3] = 255
        }
      }

      ctx.putImageData(outputData, 0, 0)
      setProcessedImage(canvas.toDataURL("image/png"))
    }
    img.src = image
  }, [image, settings])

  useEffect(() => {
    if (image) {
      processImage()
    }
  }, [image, processImage])

  const handleDownload = () => {
    if (!processedImage) return
    const link = document.createElement("a")
    link.download = "sine-wave-image.png"
    link.href = processedImage
    link.click()
  }

  const colorPresets = [
    { fg: "#ff6b35", bg: "#8b2500", name: "Orange" },
    { fg: "#d4a574", bg: "#5c4a32", name: "Tan" },
    { fg: "#e6d84c", bg: "#4a5c23", name: "Yellow-Green" },
    { fg: "#6b8cff", bg: "#1a2a5c", name: "Blue" },
    { fg: "#a78bfa", bg: "#3b2d5c", name: "Purple" },
    { fg: "#4ade80", bg: "#1a3d2e", name: "Green" },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Sine Wave Image Processor</h1>
          <p className="text-zinc-400">Upload an image to apply a retro scan line effect</p>
        </header>

        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          <div className="space-y-6">
            {!image ? (
              <ImageUploader onImageSelect={setImage} />
            ) : (
              <div className="space-y-4">
                <div className="relative aspect-[4/5] max-h-[600px] bg-zinc-900 rounded-lg overflow-hidden flex items-center justify-center">
                  {processedImage ? (
                    <img
                      src={processedImage}
                      alt="Processed"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="text-zinc-500">Processing...</div>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setImage(null)
                      setProcessedImage(null)
                    }}
                    className="flex-1"
                  >
                    Upload New Image
                  </Button>
                  <Button onClick={handleDownload} disabled={!processedImage} className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="space-y-6">
            <div className="bg-zinc-900 rounded-lg p-4">
              <h3 className="text-sm font-medium mb-3 text-zinc-300">Color Presets</h3>
              <div className="grid grid-cols-3 gap-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() =>
                      setSettings((s) => ({
                        ...s,
                        foregroundColor: preset.fg,
                        backgroundColor: preset.bg,
                      }))
                    }
                    className="group relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-zinc-600 transition-colors"
                    style={{
                      background: `linear-gradient(135deg, ${preset.fg} 50%, ${preset.bg} 50%)`,
                    }}
                  >
                    <span className="absolute inset-0 flex items-end justify-center pb-1">
                      <span className="text-[10px] font-medium text-white drop-shadow-lg">
                        {preset.name}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <EffectControls settings={settings} onChange={setSettings} />
          </div>
        </div>
      </div>
    </div>
  )
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 }
}
