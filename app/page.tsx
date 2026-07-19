"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Download, ImagePlus } from "lucide-react"

import { BackdropControls } from "@/components/backdrop-controls"
import { BackdropStage } from "@/components/backdrop-stage"
import { ColorPresets } from "@/components/color-presets"
import { CropControls } from "@/components/crop-controls"
import { EffectControls } from "@/components/effect-controls"
import { ImageCropper } from "@/components/image-cropper"
import { ImageUploader } from "@/components/image-uploader"
import { ModeToggle, type EditorMode } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import {
  DEFAULT_BACKDROP_COPY,
  renderEventBackdrop,
  type BackdropCopy,
} from "@/lib/backdrop"
import { ASPECT_OPTIONS } from "@/lib/crop-aspects"
import {
  getCroppedImageDataUrl,
  type CropArea,
} from "@/lib/crop-image"
import {
  DEFAULT_EFFECT_SETTINGS,
  type EffectSettings,
} from "@/lib/effect-settings"
import { processSineWaveImage } from "@/lib/process-sine-wave"

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a")
  link.download = filename
  link.href = dataUrl
  link.click()
}

export default function SineWaveImageProcessor() {
  const [mode, setMode] = useState<EditorMode>("image")
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [image, setImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [backdropPreview, setBackdropPreview] = useState<string | null>(null)
  const [isCropping, setIsCropping] = useState(false)
  const [aspectId, setAspectId] = useState("free")
  const [cropArea, setCropArea] = useState<CropArea | null>(null)
  const [applyingCrop, setApplyingCrop] = useState(false)
  const [renderingBackdrop, setRenderingBackdrop] = useState(false)
  const [backdropCopy, setBackdropCopy] = useState<BackdropCopy>(
    DEFAULT_BACKDROP_COPY
  )
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const backdropRequestId = useRef(0)

  const [settings, setSettings] = useState<EffectSettings>(
    DEFAULT_EFFECT_SETTINGS
  )

  const aspect = ASPECT_OPTIONS.find((option) => option.id === aspectId)?.value
  const isBackdropMode = mode === "backdrop"

  const openImage = useCallback((dataUrl: string) => {
    setOriginalImage(dataUrl)
    setImage(dataUrl)
    setProcessedImage(null)
    setBackdropPreview(null)
    setIsCropping(false)
    setCropArea(null)
    setAspectId("free")
    setMode("image")
  }, [])

  const processImage = useCallback(() => {
    if (!image || !canvasRef.current || isCropping) return

    void processSineWaveImage(canvasRef.current, image, settings).then(
      setProcessedImage
    )
  }, [image, settings, isCropping])

  useEffect(() => {
    if (image && !isCropping) {
      processImage()
    }
  }, [image, processImage, isCropping])

  useEffect(() => {
    if (!isBackdropMode || !processedImage) {
      return
    }

    const requestId = ++backdropRequestId.current
    setRenderingBackdrop(true)

    const timer = window.setTimeout(() => {
      void renderEventBackdrop(processedImage, backdropCopy)
        .then((dataUrl) => {
          if (requestId === backdropRequestId.current) {
            setBackdropPreview(dataUrl)
          }
        })
        .finally(() => {
          if (requestId === backdropRequestId.current) {
            setRenderingBackdrop(false)
          }
        })
    }, 120)

    return () => {
      window.clearTimeout(timer)
    }
  }, [isBackdropMode, processedImage, backdropCopy])

  const handleModeChange = (nextMode: EditorMode) => {
    if (nextMode === "backdrop") {
      setIsCropping(false)
      setCropArea(null)
    }
    setMode(nextMode)
  }

  const handleExport = () => {
    if (!processedImage) return

    if (isBackdropMode) {
      if (backdropPreview) {
        downloadDataUrl(backdropPreview, "event-backdrop.png")
      }
      return
    }

    downloadDataUrl(processedImage, "sine-wave-image.png")
  }

  const handleReplaceFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith("image/")) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      openImage(result)
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  const handleStartCrop = () => {
    if (!image || isBackdropMode) return
    setIsCropping(true)
    setCropArea(null)
  }

  const handleCancelCrop = () => {
    setIsCropping(false)
    setCropArea(null)
  }

  const handleApplyCrop = async () => {
    if (!image || !cropArea) return

    setApplyingCrop(true)
    try {
      const cropped = await getCroppedImageDataUrl(image, cropArea)
      setImage(cropped)
      setProcessedImage(null)
      setBackdropPreview(null)
      setIsCropping(false)
      setCropArea(null)
    } finally {
      setApplyingCrop(false)
    }
  }

  const handleReset = () => {
    if (!originalImage) return
    setImage(originalImage)
    setProcessedImage(null)
    setBackdropPreview(null)
    setIsCropping(false)
    setCropArea(null)
    setAspectId("free")
  }

  const handleAspectChange = (nextAspectId: string) => {
    if (isBackdropMode) return
    setAspectId(nextAspectId)
    if (image && !isCropping) {
      setIsCropping(true)
      setCropArea(null)
    }
  }

  const exportDisabled =
    !processedImage ||
    isCropping ||
    (isBackdropMode && (!backdropPreview || renderingBackdrop))

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-background">
      <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-3">
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleReplaceFile}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus data-icon="inline-start" />
            {image ? "Open" : "Open Image"}
          </Button>
          <ModeToggle
            mode={mode}
            onModeChange={handleModeChange}
            backdropDisabled={!processedImage || isCropping}
          />
        </div>

        <Button size="sm" onClick={handleExport} disabled={exportDisabled}>
          <Download data-icon="inline-start" />
          {isBackdropMode ? "Export Backdrop" : "Export PNG"}
        </Button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <main className="relative flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundColor: "oklch(0.18 0 0)",
              backgroundImage: `
                linear-gradient(45deg, oklch(0.22 0 0) 25%, transparent 25%),
                linear-gradient(-45deg, oklch(0.22 0 0) 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, oklch(0.22 0 0) 75%),
                linear-gradient(-45deg, transparent 75%, oklch(0.22 0 0) 75%)
              `,
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0",
            }}
          />

          <div className="relative z-1 flex size-full items-center justify-center p-4 sm:p-6">
            {!image ? (
              <ImageUploader
                onImageSelect={openImage}
                className="size-full max-h-none max-w-none rounded-xl"
              />
            ) : isBackdropMode ? (
              backdropPreview ? (
                <BackdropStage src={backdropPreview} />
              ) : (
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <Spinner className="size-6" />
                  <span className="text-sm">Rendering backdrop…</span>
                </div>
              )
            ) : isCropping ? (
              <div className="relative size-full overflow-hidden rounded-xl">
                <ImageCropper
                  key={`${image}-${aspectId}`}
                  image={image}
                  aspect={aspect}
                  onCropAreaChange={setCropArea}
                />
              </div>
            ) : processedImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={processedImage}
                alt="Processed sine-wave effect"
                className="max-h-full max-w-full object-contain shadow-2xl shadow-black/40 ring-1 ring-black/40"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Spinner className="size-6" />
                <span className="text-sm">Processing…</span>
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </main>

        <aside className="flex max-h-[48vh] min-h-0 w-full shrink-0 flex-col border-t border-border bg-card md:max-h-none md:w-[340px] md:border-t-0 md:border-l">
          <ScrollArea className="h-full">
            <div>
              {isBackdropMode ? (
                <section className="p-4">
                  <h2 className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Backdrop
                  </h2>
                  <BackdropControls
                    copy={backdropCopy}
                    onChange={setBackdropCopy}
                    disabled={!processedImage}
                  />
                </section>
              ) : (
                <>
                  <section className="p-4">
                    <h2 className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      Crop
                    </h2>
                    <CropControls
                      aspectId={aspectId}
                      onAspectChange={handleAspectChange}
                      isCropping={isCropping}
                      disabled={!image}
                      canReset={Boolean(
                        originalImage && image && originalImage !== image
                      )}
                      onStartCrop={handleStartCrop}
                      onCancelCrop={handleCancelCrop}
                      onApplyCrop={() => {
                        void handleApplyCrop()
                      }}
                      onReset={handleReset}
                      applying={applyingCrop}
                    />
                  </section>

                  <Separator />

                  <section className="p-4">
                    <h2 className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      Color Presets
                    </h2>
                    <ColorPresets
                      foregroundColor={settings.foregroundColor}
                      backgroundColor={settings.backgroundColor}
                      onSelect={(fg, bg) =>
                        setSettings((s) => ({
                          ...s,
                          foregroundColor: fg,
                          backgroundColor: bg,
                        }))
                      }
                    />
                  </section>

                  <Separator />

                  <section className="p-4">
                    <h2 className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      Effect
                    </h2>
                    <EffectControls
                      settings={settings}
                      onChange={setSettings}
                    />
                  </section>
                </>
              )}
            </div>
          </ScrollArea>
        </aside>
      </div>
    </div>
  )
}
