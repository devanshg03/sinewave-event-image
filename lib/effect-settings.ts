export interface EffectSettings {
  foregroundColor: string
  backgroundColor: string
  lineFrequency: number
  lineThickness: number
  waveAmplitude: number
  /** Topographic y-displacement from smoothed luminance (0 = flat tracks). */
  contourDepth: number
  contrast: number
  brightness: number
}

export const DEFAULT_EFFECT_SETTINGS: EffectSettings = {
  foregroundColor: "#6b8cff",
  backgroundColor: "#e8ecf5",
  lineFrequency: 8,
  lineThickness: 2,
  waveAmplitude: 1.95,
  contourDepth: 0,
  contrast: 2.15,
  brightness: -6,
}

export const COLOR_PRESETS = [
  { fg: "#6b8cff", bg: "#e8ecf5", name: "Blue" },
  { fg: "#ff6b35", bg: "#ebe6e1", name: "Orange" },
  { fg: "#d4a574", bg: "#f3ede4", name: "Tan" },
  { fg: "#a78bfa", bg: "#efeaf5", name: "Purple" },
  { fg: "#4ade80", bg: "#e6f2ea", name: "Green" },
] as const

export function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 }
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) =>
    Math.round(clamp01(n) * 255)
      .toString(16)
      .padStart(2, "0")
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/** sRGB channel → linear light (WCAG). */
function linearizeChannel(value: number): number {
  const c = clamp01(value)
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

/** Relative luminance for a 0–1 sRGB triple (WCAG 2). */
export function relativeLuminance(r: number, g: number, b: number): number {
  return (
    0.2126 * linearizeChannel(r) +
    0.7152 * linearizeChannel(g) +
    0.0722 * linearizeChannel(b)
  )
}

/** WCAG contrast ratio between two 0–255 sRGB colors (≥ 1). */
export function contrastRatio(
  first: { r: number; g: number; b: number },
  second: { r: number; g: number; b: number }
): number {
  const l1 = relativeLuminance(first.r / 255, first.g / 255, first.b / 255)
  const l2 = relativeLuminance(second.r / 255, second.g / 255, second.b / 255)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

function hslToRgb(h: number, s: number, l: number) {
  const hue = ((h % 360) + 360) % 360
  const sat = clamp01(s)
  const light = clamp01(l)
  const c = (1 - Math.abs(2 * light - 1)) * sat
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1))
  const m = light - c / 2
  let rp = 0
  let gp = 0
  let bp = 0
  if (hue < 60) {
    rp = c
    gp = x
  } else if (hue < 120) {
    rp = x
    gp = c
  } else if (hue < 180) {
    gp = c
    bp = x
  } else if (hue < 240) {
    gp = x
    bp = c
  } else if (hue < 300) {
    rp = x
    bp = c
  } else {
    rp = c
    bp = x
  }
  return { r: rp + m, g: gp + m, b: bp + m }
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

/** Minimum contrast for thin line strokes on the field (between AA large-text and normal). */
const MIN_RANDOM_CONTRAST = 4.5

/**
 * Random line/field pair: saturated ink on a light tinted field,
 * adjusted until WCAG contrast is at least {@link MIN_RANDOM_CONTRAST}.
 */
export function randomContrastColorPair(): {
  foregroundColor: string
  backgroundColor: string
} {
  for (let attempt = 0; attempt < 40; attempt++) {
    const hue = rand(0, 360)
    let fgL = rand(0.32, 0.52)
    const fgS = rand(0.55, 0.9)
    let bgL = rand(0.88, 0.96)
    const bgS = rand(0.04, 0.18)
    const bgHue = hue + rand(-18, 18)
    let fg = hslToRgb(hue, fgS, fgL)
    let bg = hslToRgb(bgHue, bgS, bgL)

    // Darken ink / lighten field until contrast clears the floor.
    for (let step = 0; step < 24; step++) {
      const fg255 = {
        r: Math.round(fg.r * 255),
        g: Math.round(fg.g * 255),
        b: Math.round(fg.b * 255),
      }
      const bg255 = {
        r: Math.round(bg.r * 255),
        g: Math.round(bg.g * 255),
        b: Math.round(bg.b * 255),
      }
      if (contrastRatio(fg255, bg255) >= MIN_RANDOM_CONTRAST) {
        return {
          foregroundColor: rgbToHex(fg.r, fg.g, fg.b).toUpperCase(),
          backgroundColor: rgbToHex(bg.r, bg.g, bg.b).toUpperCase(),
        }
      }
      fgL = Math.max(0.12, fgL - 0.03)
      bgL = Math.min(0.98, bgL + 0.015)
      fg = hslToRgb(hue, fgS, fgL)
      bg = hslToRgb(bgHue, bgS, bgL)
    }
  }

  // Deterministic fallback with known contrast.
  return {
    foregroundColor: "#FF6B35",
    backgroundColor: "#EBE6E1",
  }
}
