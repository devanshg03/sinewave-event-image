/** Layout is authored at 1920×1080, then rendered at 4K (2×). */
export const BACKDROP_DESIGN_WIDTH = 1920
export const BACKDROP_DESIGN_HEIGHT = 1080
export const BACKDROP_RENDER_SCALE = 2
export const BACKDROP_WIDTH = BACKDROP_DESIGN_WIDTH * BACKDROP_RENDER_SCALE
export const BACKDROP_HEIGHT = BACKDROP_DESIGN_HEIGHT * BACKDROP_RENDER_SCALE

export const BACKDROP_BACKGROUND = "#14120A"
export const BACKDROP_TEXT_WHITE = "#FFFFFF"
export const BACKDROP_TEXT_GREY = "#7A7972"

export type BackdropCopy = {
  headline: string
  subhead: string
  imageTitle: string
  imageSubtitle: string
}

export const DEFAULT_BACKDROP_COPY: BackdropCopy = {
  headline: "Event Title",
  subhead: "Subtitle goes here",
  imageTitle: "Speaker Name",
  imageSubtitle: "Role or detail",
}

const FONT_FAMILY = "Gothic"
const FONT_URL = "/fonts/gothic/Gothic-Regular.woff2"
const LOGO_SRC = "/brand/cursor-lockup.svg"

let fontsReady: Promise<void> | null = null

function fontSpec(size: number) {
  // Regular only — never bold / 700
  // Size is in design pixels; canvas transform scales it to output resolution
  return `400 ${size}px "${FONT_FAMILY}"`
}

async function ensureBackdropFonts(): Promise<void> {
  if (!fontsReady) {
    fontsReady = (async () => {
      if (!document.fonts.check(fontSpec(96))) {
        const href = new URL(FONT_URL, window.location.origin).href
        const face = new FontFace(FONT_FAMILY, `url(${href}) format("woff2")`, {
          weight: "400",
          style: "normal",
        })
        const loaded = await face.load()
        document.fonts.add(loaded)
      }

      // Preload at output pixel sizes for sharper 4K text
      const outputSizes = [96, 64, 36].map(
        (size) => size * BACKDROP_RENDER_SCALE
      )
      await Promise.all([
        ...[96, 64, 36].map((size) => document.fonts.load(fontSpec(size))),
        ...outputSizes.map((size) => document.fonts.load(fontSpec(size))),
      ])
      await document.fonts.ready

      if (!document.fonts.check(fontSpec(96))) {
        throw new Error("Gothic Regular failed to load for canvas")
      }
    })().catch((error) => {
      fontsReady = null
      throw error
    })
  }

  return fontsReady
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = "anonymous"
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    image.src = src
  })
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const paragraphs = text.split("\n")
  const lines: string[] = []

  for (const paragraph of paragraphs) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean)
    if (words.length === 0) {
      lines.push("")
      continue
    }

    let current = words[0]
    for (let i = 1; i < words.length; i++) {
      const next = `${current} ${words[i]}`
      if (ctx.measureText(next).width <= maxWidth) {
        current = next
      } else {
        lines.push(current)
        current = words[i]
      }
    }
    lines.push(current)
  }

  return lines
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  radius = 0
) {
  const scale = Math.max(width / image.width, height / image.height)
  const drawWidth = image.width * scale
  const drawHeight = image.height * scale
  const drawX = x + (width - drawWidth) / 2
  const drawY = y + (height - drawHeight) / 2

  ctx.save()
  ctx.beginPath()
  ctx.roundRect(x, y, width, height, radius)
  ctx.clip()
  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight)
  ctx.restore()
}

/**
 * Renders the event backdrop at 4K (3840×2160).
 * Layout math stays in 1920×1080 design units so spacing is unchanged.
 */
export async function renderEventBackdrop(
  processedImageSrc: string,
  copy: BackdropCopy
): Promise<string> {
  await ensureBackdropFonts()

  const [logo, photo] = await Promise.all([
    loadImage(LOGO_SRC),
    loadImage(processedImageSrc),
  ])

  const canvas = document.createElement("canvas")
  canvas.width = BACKDROP_WIDTH
  canvas.height = BACKDROP_HEIGHT
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    throw new Error("Canvas 2D context unavailable")
  }

  ctx.setTransform(
    BACKDROP_RENDER_SCALE,
    0,
    0,
    BACKDROP_RENDER_SCALE,
    0,
    0
  )
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = "high"

  ctx.fillStyle = BACKDROP_BACKGROUND
  ctx.fillRect(0, 0, BACKDROP_DESIGN_WIDTH, BACKDROP_DESIGN_HEIGHT)

  // Outer inset for the image stack at 1920×1080 design size
  const margin = 80
  const captionSize = 36
  const gapImageToCaption = 24

  // Cursor lockup — 80px from left edge, 80px from top (64px tall at 1920×1080)
  const logoX = margin
  const logoY = margin
  const logoHeight = 64
  const logoWidth = (logo.width / logo.height) * logoHeight
  ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight)

  // Portrait on the right (4:5), sized from 80px insets:
  // top = 80, right = 80, and 80px below the caption line
  const captionTop = BACKDROP_DESIGN_HEIGHT - margin - captionSize
  const imageY = margin
  const imageBottom = captionTop - gapImageToCaption
  const imageHeight = imageBottom - imageY
  const imageWidth = imageHeight * (4 / 5)
  const imageX = BACKDROP_DESIGN_WIDTH - margin - imageWidth

  // 16px corner radius at 1920×1080 design size
  drawCoverImage(ctx, photo, imageX, imageY, imageWidth, imageHeight, 16)

  // Captions under the image — one line, spaced across the image width
  ctx.font = fontSpec(captionSize)
  ctx.textBaseline = "top"

  const imageTitle = copy.imageTitle.trim()
  const imageSubtitle = copy.imageSubtitle.trim()

  if (imageTitle) {
    ctx.textAlign = "left"
    ctx.fillStyle = BACKDROP_TEXT_WHITE
    ctx.fillText(imageTitle, imageX, captionTop)
  }

  if (imageSubtitle) {
    ctx.textAlign = "right"
    ctx.fillStyle = BACKDROP_TEXT_GREY
    ctx.fillText(imageSubtitle, imageX + imageWidth, captionTop)
  }

  // Left title block — regular weight throughout
  const textX = margin
  const textMaxWidth = imageX - margin - 64

  const headlineSize = 96
  const subheadSize = 64

  ctx.textAlign = "left"
  ctx.textBaseline = "alphabetic"
  ctx.font = fontSpec(headlineSize)
  ctx.fillStyle = BACKDROP_TEXT_WHITE
  const headlineLines = wrapText(
    ctx,
    copy.headline.trim() || " ",
    textMaxWidth
  )

  ctx.font = fontSpec(subheadSize)
  const subheadLines = wrapText(
    ctx,
    copy.subhead.trim() || " ",
    textMaxWidth
  )

  const titleBlockHeight =
    headlineLines.length * headlineSize +
    (copy.subhead.trim() ? subheadLines.length * subheadSize : 0)

  let textY =
    imageY + imageHeight / 2 - titleBlockHeight / 2 + headlineSize * 0.75
  textY = Math.max(imageY + 48, textY)

  ctx.font = fontSpec(headlineSize)
  ctx.fillStyle = BACKDROP_TEXT_WHITE
  for (const line of headlineLines) {
    ctx.fillText(line, textX, textY)
    textY += headlineSize
  }

  if (copy.subhead.trim()) {
    ctx.font = fontSpec(subheadSize)
    ctx.fillStyle = BACKDROP_TEXT_GREY
    for (const line of subheadLines) {
      ctx.fillText(line, textX, textY)
      textY += subheadSize
    }
  }

  return canvas.toDataURL("image/png")
}
