import { describe, expect, it, vi } from 'vitest'

import { MAX_SIDE, TARGET_BYTES, compressToTarget, fitWithin } from './imageCompress'

const blobOf = (bytes: number) => new Blob([new Uint8Array(bytes)])

describe('fitWithin', () => {
  it('never upscales a small image', () => {
    expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 })
    expect(fitWithin(MAX_SIDE, 100)).toEqual({ width: MAX_SIDE, height: 100 })
  })

  it('scales a wide image so the longest side is 2000px, keeping the ratio', () => {
    expect(fitWithin(4000, 3000)).toEqual({ width: 2000, height: 1500 })
    expect(fitWithin(6000, 2000)).toEqual({ width: 2000, height: 667 })
  })

  it('scales a tall image by its height', () => {
    expect(fitWithin(3000, 6000)).toEqual({ width: 1000, height: 2000 })
  })

  it('honours a custom limit and never returns zero', () => {
    expect(fitWithin(1000, 500, 100)).toEqual({ width: 100, height: 50 })
    expect(fitWithin(10_000, 1, 100).height).toBe(1)
  })
})

describe('compressToTarget', () => {
  it('uses the best quality when it already fits', async () => {
    const encode = vi.fn(async () => blobOf(100_000))

    const result = await compressToTarget(encode, { width: 2000, height: 1500 })

    expect(encode).toHaveBeenCalledTimes(1)
    expect(result).toMatchObject({ quality: 0.85, width: 2000, height: 1500 })
  })

  it('lowers the quality first, keeping the pixels', async () => {
    // Size falls with quality: the first quality at or below the target wins.
    const encode = vi.fn(async (_w: number, _h: number, quality: number) => blobOf(Math.round(quality * 600_000)))

    const result = await compressToTarget(encode, { width: 2000, height: 1500 })

    expect(result.blob.size).toBeLessThanOrEqual(TARGET_BYTES)
    expect(result.quality).toBeLessThan(0.85)
    expect(result.width).toBe(2000)
  })

  it('shrinks the dimensions when no quality is small enough', async () => {
    // Size depends on pixels only, so only shrinking can help.
    const encode = vi.fn(async (width: number, height: number) => blobOf((width * height) / 4))

    const result = await compressToTarget(encode, { width: 2000, height: 1500 })

    expect(result.blob.size).toBeLessThanOrEqual(TARGET_BYTES)
    expect(result.width).toBeLessThan(2000)
    // The aspect ratio survives the shrinking (within rounding).
    expect(result.width / result.height).toBeCloseTo(2000 / 1500, 1)
  })

  it('gives up with the smallest attempt instead of looping forever', async () => {
    const encode = vi.fn(async () => blobOf(5_000_000))

    const result = await compressToTarget(encode, { width: 100, height: 100 })

    expect(result.blob.size).toBe(5_000_000)
    // 7 quality steps for each of 7 sizes (the original plus 6 shrinks).
    expect(encode).toHaveBeenCalledTimes(49)
  })

  it('respects a custom byte target', async () => {
    const encode = vi.fn(async (_w: number, _h: number, quality: number) => blobOf(Math.round(quality * 100_000)))

    const result = await compressToTarget(encode, { width: 500, height: 500 }, 50_000)

    expect(result.blob.size).toBeLessThanOrEqual(50_000)
  })
})
