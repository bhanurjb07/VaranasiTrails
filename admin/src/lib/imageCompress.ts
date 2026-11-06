// Browser-side image preparation: resize and convert to WebP before uploading.
// The pure parts (fitWithin, compressToTarget) are unit tested; compressImage wires
// them to the canvas.

export const MAX_SIDE = 2000
export const TARGET_BYTES = 400 * 1024

/** Scales (width, height) down so the longest side is at most `maxSide`. Never upscales. */
export const fitWithin = (width: number, height: number, maxSide = MAX_SIDE) => {
  const longest = Math.max(width, height)
  if (longest <= maxSide) return { width, height }
  const scale = maxSide / longest
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) }
}

const QUALITIES = [0.85, 0.78, 0.7, 0.62, 0.54, 0.46, 0.38] as const
const MAX_SHRINKS = 6
const SHRINK = 0.85

export interface Encoded {
  blob: Blob
  width: number
  height: number
  quality: number
}

/**
 * Finds the best-looking encoding under `targetBytes`: lowers quality first, then shrinks
 * the pixels, then gives up and returns the smallest attempt. `encode` is injected so the
 * search can be tested without a canvas.
 */
export const compressToTarget = async (
  encode: (width: number, height: number, quality: number) => Promise<Blob>,
  size: { width: number; height: number },
  targetBytes = TARGET_BYTES,
): Promise<Encoded> => {
  let { width, height } = size
  let smallest: Encoded | null = null

  for (let shrink = 0; shrink <= MAX_SHRINKS; shrink++) {
    for (const quality of QUALITIES) {
      const blob = await encode(width, height, quality)
      const attempt = { blob, width, height, quality }
      if (blob.size <= targetBytes) return attempt
      if (!smallest || blob.size < smallest.blob.size) smallest = attempt
    }
    width = Math.max(1, Math.round(width * SHRINK))
    height = Math.max(1, Math.round(height * SHRINK))
  }
  return smallest as Encoded
}

export interface CompressedImage {
  blob: Blob
  width: number
  height: number
  contentType: 'image/webp'
  originalBytes: number
}

const canvasToBlob = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not encode the image'))), 'image/webp', quality),
  )

/** Decodes a picked file, resizes it to about 2000px and re-encodes it as WebP under about 400 KB. */
export const compressImage = async (file: File): Promise<CompressedImage> => {
  if (!file.type.startsWith('image/')) throw new Error(`${file.name} is not an image`)

  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error(`${file.name} could not be read as an image`)
  })

  try {
    const start = fitWithin(bitmap.width, bitmap.height)
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Image processing is not available in this browser')

    const result = await compressToTarget(async (width, height, quality) => {
      canvas.width = width
      canvas.height = height
      context.clearRect(0, 0, width, height)
      context.drawImage(bitmap, 0, 0, width, height)
      return canvasToBlob(canvas, quality)
    }, start)

    return { blob: result.blob, width: result.width, height: result.height, contentType: 'image/webp', originalBytes: file.size }
  } finally {
    bitmap.close()
  }
}
