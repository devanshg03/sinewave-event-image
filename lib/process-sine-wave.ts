import { hexToRgb, type EffectSettings } from "@/lib/effect-settings"

/**
 * Applies the sine-wave scan-line duotone effect to a canvas.
 * Logic is preserved from the reference image-to-sinewave-effect app.
 */
export function processSineWaveImage(
  canvas: HTMLCanvasElement,
  imageSrc: string,
  settings: EffectSettings
): Promise<string> {
  return new Promise((resolve, reject) => {
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      reject(new Error("Canvas 2D context unavailable"))
      return
    }

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
        let gray =
          (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114) /
          255
        // Apply contrast and brightness
        gray =
          (gray - 0.5) * settings.contrast + 0.5 + settings.brightness / 100
        grayscale[i] = Math.max(0, Math.min(1, gray))
      }

      // Create output image data for pixel-level control
      const outputData = ctx.createImageData(width, height)

      // Parse colors
      const fgR = fgColor.r,
        fgG = fgColor.g,
        fgB = fgColor.b
      const bgR = bgColor.r,
        bgG = bgColor.g,
        bgB = bgColor.b

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
      resolve(canvas.toDataURL("image/png"))
    }
    img.onerror = () => reject(new Error("Failed to load image"))
    img.src = imageSrc
  })
}
