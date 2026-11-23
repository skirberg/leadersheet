// Just enough PNG for the brand checks: read the size, decode 8-bit RGB(A) and grey to RGBA, and compare two images.
// No packages: zlib from Node does the inflating.
import { inflateSync } from "node:zlib"

export function pngSize(buf: Buffer) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error("not a PNG")
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
}

/** Decodes a non-interlaced 8-bit PNG (grey, grey+alpha, RGB, RGBA or palette) to RGBA. */
export function decodePng(buf: Buffer) {
  const { width, height } = pngSize(buf)
  const depth = buf[24]
  const type = buf[25]
  if (depth !== 8 || buf[28] !== 0) throw new Error(`unsupported PNG (depth ${depth}, interlace ${buf[28]})`)
  const channels = ({ 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 } as Record<number, number>)[type]
  const idat: Buffer[] = []
  let palette: Buffer | null = null
  let trns: Buffer | null = null
  for (let o = 8; o < buf.length; ) {
    const len = buf.readUInt32BE(o)
    const kind = buf.toString("latin1", o + 4, o + 8)
    const data = buf.subarray(o + 8, o + 8 + len)
    if (kind === "IDAT") idat.push(data)
    else if (kind === "PLTE") palette = data
    else if (kind === "tRNS") trns = data
    o += 12 + len
  }
  const raw = inflateSync(Buffer.concat(idat))
  const stride = width * channels
  const px = Buffer.alloc(width * height * channels)
  for (let y = 0; y < height; y++) {
    const f = raw[y * (stride + 1)]
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1))
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? px[y * stride + x - channels] : 0
      const b = y > 0 ? px[(y - 1) * stride + x] : 0
      const c = x >= channels && y > 0 ? px[(y - 1) * stride + x - channels] : 0
      let v = line[x]
      if (f === 1) v += a
      else if (f === 2) v += b
      else if (f === 3) v += (a + b) >> 1
      else if (f === 4) {
        const p = a + b - c
        const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c)
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c
      }
      px[y * stride + x] = v & 255
    }
  }
  const rgba = Buffer.alloc(width * height * 4)
  for (let i = 0; i < width * height; i++) {
    let r: number, g: number, b: number, al = 255
    if (type === 3) {
      const k = px[i]
      r = palette![k * 3]; g = palette![k * 3 + 1]; b = palette![k * 3 + 2]
      if (trns && k < trns.length) al = trns[k]
    } else if (channels <= 2) {
      r = g = b = px[i * channels]
      if (channels === 2) al = px[i * 2 + 1]
    } else {
      r = px[i * channels]; g = px[i * channels + 1]; b = px[i * channels + 2]
      if (channels === 4) al = px[i * 4 + 3]
    }
    rgba.set([r, g, b, al], i * 4)
  }
  return { width, height, rgba }
}

/**
 * How far apart two renders are: the share of pixels where any channel moved by more than `tolerance`.
 * Anti-aliasing from another Chrome build moves a few edge pixels slightly; a new word, colour or shape moves many.
 */
export function pngDiff(a: Buffer, b: Buffer, tolerance = 48) {
  const A = decodePng(a)
  const B = decodePng(b)
  if (A.width !== B.width || A.height !== B.height) return { sameSize: false, changed: 1 }
  let changed = 0
  for (let i = 0; i < A.rgba.length; i += 4) {
    for (let c = 0; c < 4; c++) {
      if (Math.abs(A.rgba[i + c] - B.rgba[i + c]) > tolerance) {
        changed++
        break
      }
    }
  }
  return { sameSize: true, changed: changed / (A.width * A.height) }
}
