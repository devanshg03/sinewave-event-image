"use client"

import { useEffect, useRef, useState } from "react"

import {
  BACKDROP_BACKGROUND,
  BACKDROP_HEIGHT,
  BACKDROP_WIDTH,
} from "@/lib/backdrop"

interface BackdropStageProps {
  src: string
  alt?: string
}

/**
 * Fits the 16:9 backdrop (authored 1920×1080, rendered at 4K) into the
 * available space, scaling uniformly so preview matches export.
 */
export function BackdropStage({
  src,
  alt = "Event backdrop preview",
}: BackdropStageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [stage, setStage] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const update = () => {
      const width = element.clientWidth
      const height = element.clientHeight
      if (width <= 0 || height <= 0) return

      const ratio = BACKDROP_WIDTH / BACKDROP_HEIGHT
      let nextWidth = width
      let nextHeight = width / ratio

      if (nextHeight > height) {
        nextHeight = height
        nextWidth = height * ratio
      }

      setStage({ width: nextWidth, height: nextHeight })
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      className="flex size-full min-h-0 min-w-0 items-center justify-center"
    >
      <div
        className="relative overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-black/40"
        style={{
          width: stage.width,
          height: stage.height,
          backgroundColor: BACKDROP_BACKGROUND,
          aspectRatio: `${BACKDROP_WIDTH} / ${BACKDROP_HEIGHT}`,
        }}
      >
        {stage.width > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            width={BACKDROP_WIDTH}
            height={BACKDROP_HEIGHT}
            className="size-full object-fill"
            draggable={false}
          />
        ) : null}
      </div>
    </div>
  )
}
