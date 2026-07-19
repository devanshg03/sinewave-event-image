export type CropArea = {
  x: number
  y: number
  width: number
  height: number
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = "anonymous"
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("Failed to load image for crop"))
    image.src = src
  })
}

/** Crops `imageSrc` to `pixelCrop` and returns a PNG data URL. */
export async function getCroppedImageDataUrl(
  imageSrc: string,
  pixelCrop: CropArea
): Promise<string> {
  const image = await loadImage(imageSrc)
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    throw new Error("Canvas 2D context unavailable")
  }

  const width = Math.max(1, Math.round(pixelCrop.width))
  const height = Math.max(1, Math.round(pixelCrop.height))

  canvas.width = width
  canvas.height = height

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    width,
    height
  )

  return canvas.toDataURL("image/png")
}
