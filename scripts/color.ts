// Colour maths shared by the token generator, the contrast check and the brand kit. No packages.
//   OKLCH <-> sRGB (Björn Ottosson's matrices), WCAG 2.2 contrast ratio, and APCA lightness contrast (Lc).

export type Rgb = [number, number, number]
export type Oklch = [number, number, number]

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
export const toLinear = (x: number) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)
const toGamma = (x: number) => (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055)

/** OKLCH (L 0 to 1, C, H in degrees) to sRGB, unclamped: a channel outside 0 to 1 means out of the sRGB gamut. */
export function oklchToRgbRaw([l, c, h]: Oklch): Rgb {
  const a = c * Math.cos((h * Math.PI) / 180)
  const b = c * Math.sin((h * Math.PI) / 180)
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ].map(toGamma) as Rgb
}
export const oklchToRgb = (c: Oklch): Rgb => oklchToRgbRaw(c).map(clamp01) as Rgb
export const inSrgb = (c: Oklch) => oklchToRgbRaw(c).every((x) => x > -0.0005 && x < 1.0005)

export function rgbToOklch([r, g, b]: Rgb): Oklch {
  const [R, G, B] = [r, g, b].map(toLinear)
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B)
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B)
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B)
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const Bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  const C = Math.hypot(A, Bb)
  return [L, C, C < 1e-4 ? 0 : ((Math.atan2(Bb, A) * 180) / Math.PI + 360) % 360]
}

export const hexToRgb = (hex: string): Rgb => [0, 2, 4].map((i) => parseInt(hex.slice(1 + i, 3 + i), 16) / 255) as Rgb
export const toHex = (c: Rgb) => "#" + c.map((x) => Math.round(clamp01(x) * 255).toString(16).padStart(2, "0")).join("")

/** CSS oklch() with enough digits that it lands on the same 8-bit sRGB colour as the hex it came from. */
export const cssOklch = ([l, c, h]: Oklch, alpha = 1) =>
  `oklch(${+(l * 100).toFixed(2)}% ${+c.toFixed(4)} ${+h.toFixed(2)}${alpha < 1 ? ` / ${alpha}` : ""})`

/** A solid colour over a background: what the eye gets from a translucent token (a tint, a soft fill). */
export const over = (fg: Rgb, alpha: number, bg: Rgb): Rgb => fg.map((x, i) => x * alpha + bg[i] * (1 - alpha)) as Rgb

/** CSS colour strings the tokens and presets use: #rgb, #rrggbb, oklch(L% C H) and white/black. */
export function parseColor(v: string): Rgb | null {
  v = v.trim().toLowerCase()
  let m = /^#([0-9a-f]{3})$/.exec(v)
  if (m) return [...m[1]].map((h) => parseInt(h + h, 16) / 255) as Rgb
  m = /^#([0-9a-f]{6})$/.exec(v)
  if (m) return hexToRgb(v)
  m = /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)\s*\)$/.exec(v)
  if (m) return oklchToRgb([Number(m[1]) / (m[2] ? 100 : 1), Number(m[3]), Number(m[4])])
  if (v === "white") return [1, 1, 1]
  if (v === "black") return [0, 0, 0]
  return null
}

/** The same, with an alpha (`/ 0.1` in oklch() or rgb()), for presets that write translucent tokens by hand. */
export function parseColorAlpha(v: string): { rgb: Rgb; alpha: number } | null {
  const m = /^(oklch|rgb)\(\s*([^/)]+?)\s*\/\s*([\d.]+%?)\s*\)$/i.exec(v.trim())
  if (!m) {
    const rgb = parseColor(v)
    return rgb ? { rgb, alpha: 1 } : null
  }
  const alpha = m[3].endsWith("%") ? Number(m[3].slice(0, -1)) / 100 : Number(m[3])
  if (m[1].toLowerCase() === "rgb") {
    const [r, g, b] = m[2].split(/[\s,]+/).map(Number)
    return { rgb: [r / 255, g / 255, b / 255], alpha }
  }
  const rgb = parseColor(`oklch(${m[2]})`)
  return rgb ? { rgb, alpha } : null
}

/* ─────────────── Contrast ─────────────── */

export const luminance = (c: Rgb) => {
  const [r, g, b] = c.map(toLinear)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
/** WCAG 2.2 contrast ratio, 1 to 21. */
export const wcag = (a: Rgb, b: Rgb) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

/**
 * APCA lightness contrast (Lc) of text on a background, 0.0.98G-4g constants (git.apcacontrast.com). Signed: positive
 * for dark text on light, negative for light on dark; compare the absolute value. A second look beside WCAG 2.2, which
 * stays the rule while APCA is in public beta.
 */
export function apca(text: Rgb, bg: Rgb) {
  const y = ([r, g, b]: Rgb) => 0.2126729 * r ** 2.4 + 0.7151522 * g ** 2.4 + 0.072175 * b ** 2.4
  const clampBlack = (v: number) => (v < 0.022 ? v + (0.022 - v) ** 1.414 : v)
  const yt = clampBlack(y(text))
  const yb = clampBlack(y(bg))
  if (Math.abs(yb - yt) < 0.0005) return 0
  if (yb > yt) {
    const s = (yb ** 0.56 - yt ** 0.57) * 1.14
    return s < 0.1 ? 0 : (s - 0.027) * 100
  }
  const s = (yb ** 0.65 - yt ** 0.62) * 1.14
  return s > -0.1 ? 0 : (s + 0.027) * 100
}
