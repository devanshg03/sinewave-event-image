import { hexToRgb, type EffectSettings } from "@/lib/effect-settings"

/**
 * Box-blur a single-channel float buffer (used to smooth amplitude envelopes).
 */
function blurChannel(
  src: Float32Array,
  width: number,
  height: number,
  radius: number
): Float32Array {
  if (radius <= 0) return src

  const tmp = new Float32Array(width * height)
  const out = new Float32Array(width * height)
  const r = Math.floor(radius)
  const diam = r * 2 + 1

  for (let y = 0; y < height; y++) {
    let sum = 0
    for (let x = -r; x <= r; x++) {
      sum += src[y * width + Math.min(width - 1, Math.max(0, x))]
    }
    for (let x = 0; x < width; x++) {
      tmp[y * width + x] = sum / diam
      const leave = src[y * width + Math.min(width - 1, Math.max(0, x - r))]
      const enter = src[y * width + Math.min(width - 1, x + r + 1)]
      sum += enter - leave
    }
  }

  for (let x = 0; x < width; x++) {
    let sum = 0
    for (let y = -r; y <= r; y++) {
      sum += tmp[Math.min(height - 1, Math.max(0, y)) * width + x]
    }
    for (let y = 0; y < height; y++) {
      out[y * width + x] = sum / diam
      const leave = tmp[Math.min(height - 1, Math.max(0, y - r)) * width + x]
      const enter = tmp[Math.min(height - 1, y + r + 1) * width + x]
      sum += enter - leave
    }
  }

  return out
}

/** Lightweight 3x3 Sobel magnitude for edge-aware amp on flat/low-contrast photos. */
function sobelMagnitude(
  src: Float32Array,
  width: number,
  height: number
): Float32Array {
  const out = new Float32Array(width * height)
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x
      const tl = src[i - width - 1]
      const tc = src[i - width]
      const tr = src[i - width + 1]
      const ml = src[i - 1]
      const mr = src[i + 1]
      const bl = src[i + width - 1]
      const bc = src[i + width]
      const br = src[i + width + 1]
      const gx = -tl + tr - 2 * ml + 2 * mr - bl + br
      const gy = -tl - 2 * tc - tr + bl + 2 * bc + br
      out[i] = Math.min(1, Math.hypot(gx, gy))
    }
  }
  return out
}

function sampleBilinear(
  buffer: Float32Array,
  width: number,
  height: number,
  x: number,
  y: number
): number {
  const xClamped = Math.min(width - 1, Math.max(0, x))
  const yClamped = Math.min(height - 1, Math.max(0, y))
  const x0 = Math.floor(xClamped)
  const y0 = Math.floor(yClamped)
  const x1 = Math.min(width - 1, x0 + 1)
  const y1 = Math.min(height - 1, y0 + 1)
  const fx = xClamped - x0
  const fy = yClamped - y0

  const v00 = buffer[y0 * width + x0]
  const v10 = buffer[y0 * width + x1]
  const v01 = buffer[y1 * width + x0]
  const v11 = buffer[y1 * width + x1]

  return (
    v00 * (1 - fx) * (1 - fy) +
    v10 * fx * (1 - fy) +
    v01 * (1 - fx) * fy +
    v11 * fx * fy
  )
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge0 === edge1) return x < edge0 ? 0 : 1
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

export type PreparedSineWave = {
  width: number
  height: number
  ampMap: Float32Array
  contourMap: Float32Array
  settings: EffectSettings
}

/**
 * Decode and preprocess a source image for the wavy-line effect.
 */
export function prepareSineWave(
  imageSrc: string,
  settings: EffectSettings
): Promise<PreparedSineWave> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      // Higher working res keeps eye/hair structure above the line pitch.
      const maxSize = 1200
      const minSize = 1000
      let width = img.naturalWidth || img.width
      let height = img.naturalHeight || img.height

      if (width < 1 || height < 1) {
        reject(new Error("Image has invalid dimensions"))
        return
      }

      const longest = Math.max(width, height)
      if (longest < minSize) {
        const scale = minSize / longest
        width *= scale
        height *= scale
      } else if (longest > maxSize) {
        const scale = maxSize / longest
        width *= scale
        height *= scale
      }

      width = Math.max(1, Math.round(width))
      height = Math.max(1, Math.round(height))

      const probe = document.createElement("canvas")
      probe.width = width
      probe.height = height
      const probeCtx = probe.getContext("2d")
      if (!probeCtx) {
        reject(new Error("Canvas 2D context unavailable"))
        return
      }

      probeCtx.imageSmoothingEnabled = true
      probeCtx.imageSmoothingQuality = "high"
      probeCtx.drawImage(img, 0, 0, width, height)
      const data = probeCtx.getImageData(0, 0, width, height).data

      const grayscale = new Float32Array(width * height)
      for (let i = 0; i < width * height; i++) {
        const idx = i * 4
        let gray =
          (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114) /
          255
        gray =
          (gray - 0.5) * settings.contrast + 0.5 + settings.brightness / 100
        grayscale[i] = Math.max(0, Math.min(1, gray))
      }

      // Stronger unsharp: pupils / hair edges need to survive the line pitch.
      const soft = blurChannel(grayscale, width, height, 1)
      const sharpened = new Float32Array(width * height)
      const amount = 1.85
      for (let i = 0; i < grayscale.length; i++) {
        sharpened[i] = Math.max(
          0,
          Math.min(1, grayscale[i] + (grayscale[i] - soft[i]) * amount)
        )
      }

      // Light edge pull for flat lighting without smearing eye sockets.
      const edges = sobelMagnitude(sharpened, width, height)
      const edgeBoost = 0.1
      for (let i = 0; i < sharpened.length; i++) {
        sharpened[i] = Math.max(
          0,
          Math.min(1, sharpened[i] - edges[i] * edgeBoost)
        )
      }

      const lineSpacing = Math.max(2, settings.lineThickness)
      // Sharp amp map — no extra blur (bilinear sampling is enough).
      const ampMap = sharpened
      const contourMap = blurChannel(
        sharpened,
        width,
        height,
        Math.max(2, Math.round(lineSpacing * 1.6))
      )

      resolve({ width, height, ampMap, contourMap, settings })
    }
    img.onerror = () => reject(new Error("Failed to load image"))
    img.src = imageSrc
  })
}

/**
 * Paint one frame. `scanProgress` 0 = quiet floor ripple; 1 = full effect.
 * The image signal reveals top → bottom as progress increases.
 */
export function renderSineWaveFrame(
  ctx: CanvasRenderingContext2D,
  prepared: PreparedSineWave,
  scanProgress: number
): void {
  const { width, height, ampMap, contourMap, settings } = prepared
  const progress = Math.min(1, Math.max(0, scanProgress))

  const bg = hexToRgb(settings.backgroundColor)
  const fg = hexToRgb(settings.foregroundColor)

  ctx.fillStyle = `rgb(${bg.r},${bg.g},${bg.b})`
  ctx.fillRect(0, 0, width, height)

  ctx.strokeStyle = `rgb(${fg.r},${fg.g},${fg.b})`
  ctx.lineCap = "round"
  ctx.lineJoin = "round"

  const lineSpacing = Math.max(2, settings.lineThickness)
  // Slightly tighter carrier so an eye spans more cycles (more internal detail).
  const period = Math.max(3.2, 7.2 - settings.lineFrequency * 0.38)
  const waveFrequency = (Math.PI * 2) / period
  // Cap overlap so darks stay as readable zigzags, not solid blobs.
  const maxAmplitude = settings.waveAmplitude * lineSpacing * 1.15
  const contourDepth = settings.contourDepth * lineSpacing * 0.4
  const baseRipple = Math.max(0.14, lineSpacing * 0.07)
  const strokeWidth = Math.max(0.45, lineSpacing * 0.2)

  ctx.lineWidth = strokeWidth

  const feather = Math.max(lineSpacing * 4, height * 0.05)
  const yPad = maxAmplitude + contourDepth + baseRipple
  const scanY = -feather + progress * (height + yPad + feather * 2)

  for (let baseY = -yPad; baseY < height + yPad; baseY += lineSpacing) {
    const effectMix =
      progress <= 0
        ? 0
        : 1 - smoothstep(scanY - feather, scanY + feather, baseY)

    ctx.beginPath()
    let started = false

    for (let x = 0; x <= width; x += 1) {
      const brightness = sampleBilinear(ampMap, width, height, x, baseY)
      const darkness = 1 - brightness
      // Milder knee preserves mid-detail in hair/eyelids.
      const shaped = Math.pow(smoothstep(0.08, 0.97, darkness), 1.55)
      const signalAmp = (maxAmplitude - baseRipple) * shaped * effectMix
      const amplitude = baseRipple + signalAmp

      let contour = 0
      if (contourDepth > 0 && effectMix > 0) {
        const smooth = sampleBilinear(contourMap, width, height, x, baseY)
        contour = (0.5 - smooth) * contourDepth * effectMix
      }

      const py = baseY + contour + Math.sin(x * waveFrequency) * amplitude

      if (!started) {
        ctx.moveTo(x, py)
        started = true
      } else {
        ctx.lineTo(x, py)
      }
    }

    ctx.stroke()
  }
}

/**
 * Applies the sine-wave effect and returns a PNG data URL (full reveal).
 */
export function processSineWaveImage(
  canvas: HTMLCanvasElement,
  imageSrc: string,
  settings: EffectSettings
): Promise<string> {
  return prepareSineWave(imageSrc, settings).then((prepared) => {
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      throw new Error("Canvas 2D context unavailable")
    }
    canvas.width = prepared.width
    canvas.height = prepared.height
    renderSineWaveFrame(ctx, prepared, 1)
    return canvas.toDataURL("image/png")
  })
}
