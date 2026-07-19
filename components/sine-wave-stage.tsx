"use client"

import { useEffect, useEffectEvent, useRef } from "react"

import type { EffectSettings } from "@/lib/effect-settings"
import {
  prepareSineWave,
  renderSineWaveFrame,
} from "@/lib/process-sine-wave"

const SCAN_HOLD_MS = 280
const SCAN_DURATION_MS = 1400

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3
}

interface SineWaveStageProps {
  imageSrc: string
  settings: EffectSettings
  onProcessed: (dataUrl: string) => void
}

export function SineWaveStage({
  imageSrc,
  settings,
  onProcessed,
}: SineWaveStageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const hasScannedRef = useRef(false)
  const rafRef = useRef(0)
  const requestIdRef = useRef(0)

  const publishProcessed = useEffectEvent((dataUrl: string) => {
    onProcessed(dataUrl)
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const requestId = ++requestIdRef.current
    let cancelled = false
    const shouldScan = !hasScannedRef.current

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const stopRaf = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = 0
      }
    }

    stopRaf()

    void prepareSineWave(imageSrc, settings)
      .then((prepared) => {
        if (cancelled || requestId !== requestIdRef.current) return

        canvas.width = prepared.width
        canvas.height = prepared.height

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const finish = () => {
          renderSineWaveFrame(ctx, prepared, 1)
          hasScannedRef.current = true
          publishProcessed(canvas.toDataURL("image/png"))
        }

        // First paint for this image scans in; later setting tweaks snap.
        if (!shouldScan || reduceMotion) {
          finish()
          return
        }

        renderSineWaveFrame(ctx, prepared, 0)
        const startedAt = performance.now()

        const tick = (now: number) => {
          if (cancelled || requestId !== requestIdRef.current) return

          const elapsed = now - startedAt
          let progress = 0
          if (elapsed > SCAN_HOLD_MS) {
            progress = Math.min(1, (elapsed - SCAN_HOLD_MS) / SCAN_DURATION_MS)
          }

          renderSineWaveFrame(ctx, prepared, easeOutCubic(progress))

          if (progress < 1) {
            rafRef.current = requestAnimationFrame(tick)
          } else {
            rafRef.current = 0
            hasScannedRef.current = true
            publishProcessed(canvas.toDataURL("image/png"))
          }
        }

        rafRef.current = requestAnimationFrame(tick)
      })
      .catch((error: unknown) => {
        if (cancelled || requestId !== requestIdRef.current) return
        console.error("Failed to process sine-wave image", error)
      })

    return () => {
      cancelled = true
      stopRaf()
    }
  }, [imageSrc, settings])

  return (
    <canvas
      ref={canvasRef}
      aria-label="Processed sine-wave effect"
      className="max-h-full max-w-full object-contain shadow-2xl shadow-black/40 ring-1 ring-black/40"
    />
  )
}
