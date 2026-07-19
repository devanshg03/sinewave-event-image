export interface EffectSettings {
  foregroundColor: string
  backgroundColor: string
  lineFrequency: number
  lineThickness: number
  waveAmplitude: number
  contrast: number
  brightness: number
}

export const DEFAULT_EFFECT_SETTINGS: EffectSettings = {
  foregroundColor: "#ff6b35",
  backgroundColor: "#8b2500",
  lineFrequency: 6,
  lineThickness: 2,
  waveAmplitude: 1.0,
  contrast: 1.5,
  brightness: 0,
}

export const COLOR_PRESETS = [
  { fg: "#ff6b35", bg: "#8b2500", name: "Orange" },
  { fg: "#d4a574", bg: "#5c4a32", name: "Tan" },
  { fg: "#e6d84c", bg: "#4a5c23", name: "Yellow-Green" },
  { fg: "#6b8cff", bg: "#1a2a5c", name: "Blue" },
  { fg: "#a78bfa", bg: "#3b2d5c", name: "Purple" },
  { fg: "#4ade80", bg: "#1a3d2e", name: "Green" },
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
