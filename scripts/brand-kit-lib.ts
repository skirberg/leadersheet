// Shared by the brand kit scripts: the active preset, its tokens and colours, the logo files drawn from the preset's own
// LogoMark and Wordmark, the record of what each generator produced, and a small zip writer. No packages.
import { createHash } from "node:crypto"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { deflateRawSync } from "node:zlib"
import { KIT_DIR, LOGO_VARIANTS, LOGO_WIDTHS, MARK_SIZES, MARK_VARIANTS, BANNERS, type LogoVariant } from "../src/brand/kit.ts"

export const sha256 = (b: string | Buffer) => createHash("sha256").update(b).digest("hex")

export const activePreset = () => /presets\/([\w-]+)\/brand/.exec(readFileSync("src/brand/index.ts", "utf8"))?.[1] ?? "leadersheet"
export const presetDir = (p = activePreset()) => `src/brand/presets/${p}`

export async function brandOf(p = activePreset()) {
  const { BRAND } = (await import(`../${presetDir(p)}/brand.ts`)) as { BRAND: { id: string; name: string; url: string; descriptor: string; never?: string[] } }
  return BRAND
}

/* ─────────────── Colour ─────────────── */

// The maths lives in color.ts (shared with the token generator and the contrast check).
import { luminance, parseColor, rgbToOklch as oklchOf, toHex, wcag as contrast, type Rgb } from "./color.ts"
export { contrast, parseColor, toHex, type Rgb }

/** CSS oklch() of an sRGB colour, rounded for reading (the kit's colour table). */
export function rgbToOklch(c: Rgb) {
  const [L, C, H] = oklchOf(c)
  return `oklch(${(L * 100).toFixed(1)}% ${C.toFixed(3)} ${H.toFixed(1)})`
}
/** Naive CMYK from sRGB. An approximation for briefing a printer, not a colour-managed conversion. */
export function cmykApprox([r, g, b]: Rgb) {
  const k = 1 - Math.max(r, g, b)
  if (k >= 1) return [0, 0, 0, 100]
  return [(1 - r - k) / (1 - k), (1 - g - k) / (1 - k), (1 - b - k) / (1 - k), k].map((x) => Math.round(x * 100))
}

export type Tokens = { light: Record<string, string>; dark: Record<string, string>; css: string }
export function readTokens(p = activePreset()): Tokens {
  const css = readFileSync(`${presetDir(p)}/tokens.css`, "utf8")
  const block = (sel: string) => {
    const m = css.match(new RegExp(sel.replace(".", "\\.") + "\\s*\\{([^}]*)\\}"))
    return Object.fromEntries([...(m?.[1] ?? "").matchAll(/--([\w-]+):\s*([^;]+);/g)].map((x) => [x[1], x[2].trim()]))
  }
  return { light: block(":root"), dark: block(".dark"), css }
}
export const hexOf = (t: Record<string, string>, name: string) => {
  const c = parseColor(t[name] ?? "")
  if (!c) throw new Error(`token --${name} is not a solid colour (${t[name]})`)
  return toHex(c)
}

/** What each colour is for, from DESIGN.md. Tokens not listed here are interface plumbing and stay out of the kit. */
export const COLOR_ROLES: [string, string][] = [
  ["background", "Page"],
  ["card", "Cards"],
  ["foreground", "Ink"],
  ["muted-foreground", "Secondary text"],
  ["border", "Rules"],
  ["signal", "Signal, one thing per view"],
  ["signal-text", "Signal as small text"],
  ["signal-2", "Second ink, used rarely"],
]
export const CONTRAST_PAIRS: [string, string, number, string][] = [
  ["foreground", "background", 4.5, "Text"],
  ["muted-foreground", "background", 4.5, "Secondary text"],
  ["muted-foreground", "card", 4.5, "Secondary text on cards"],
  ["signal-text", "background", 4.5, "Signal as small text"],
  ["signal", "background", 3, "Signal marks and large text"],
  ["signal-foreground", "signal", 4.5, "Text on signal"],
]

/* ─────────────── The logo files ─────────────── */

/** The preset's LogoMark and Wordmark as React renders them, read from the built page /og/brand/. */
export function sourceArt(out = "out") {
  const html = readFileSync(`${out}/og/brand/index.html`, "utf8")
  const pick = (art: string) => {
    const m = new RegExp(`data-art="${art}"[^>]*>\\s*(<svg[\\s\\S]*?</svg>)\\s*</div>`).exec(html)
    if (!m) throw new Error(`/og/brand/ has no <svg> for data-art="${art}". The kit needs the preset's ${art === "mark" ? "LogoMark" : "Wordmark"} to render as one outlined SVG.`)
    return m[1]
  }
  return { mark: pick("mark"), wordmark: pick("wordmark") }
}

/** Removes what only the site needs (classes, styles, labels) and keeps the drawing exactly as drawn. */
export function cleanSvg(svg: string) {
  const vb = /viewBox="([^"]+)"/.exec(svg)?.[1]
  if (!vb) throw new Error("svg without a viewBox")
  const inner = svg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "")
  // React writes empty elements with an explicit end tag; an SVG file reads better self-closed.
  const tidy = inner.replace(/<(\w+)([^<>]*?)><\/\1>/g, "<$1$2/>").replace(/\s(class|style|role|aria-[\w-]+)="[^"]*"/g, "")
  const [x, y, w, h] = vb.split(/[\s,]+/).map(Number)
  return { vb, x, y, w, h, inner: tidy }
}

type Role = "ink" | "paper" | "signal" | "none"
export type Inks = { ink: string; paper: string; signal: string }

/** Every fill and stroke in the drawing is ink, paper or signal; a variant decides what each becomes. */
function classify(value: string, t: Tokens): Role {
  const v = value.trim().toLowerCase()
  if (v === "none" || v === "transparent") return "none"
  if (v === "currentcolor") return "ink"
  if (v.startsWith("var(--signal")) return "signal"
  const tok = /^var\(--([\w-]+)\)$/.exec(v)?.[1]
  const c = parseColor(tok ? t.light[tok] ?? "" : v)
  if (!c) return "ink"
  const hex = toHex(c)
  if (hex === hexOf(t.light, "signal") || hex === hexOf(t.dark, "signal")) return "signal"
  return luminance(c) > 0.5 ? "paper" : "ink"
}

function recolor(inner: string, t: Tokens, to: (r: Role) => string) {
  return inner.replace(/\s(fill|stroke)="([^"]+)"/g, (all, attr, v) => {
    const r = classify(v, t)
    return r === "none" ? all : ` ${attr}="${to(r)}"`
  })
}

const svgDoc = (vb: string, body: string, w?: number, h?: number) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"${w ? ` width="${w}" height="${h}"` : ""}>${body}</svg>\n`

/** The colour each variant gives ink, paper and signal. "knockout" leaves paper transparent. */
export function inksFor(v: LogoVariant, t: Tokens): Inks {
  switch (v) {
    case "color":
      return { ink: hexOf(t.light, "foreground"), paper: hexOf(t.light, "card"), signal: hexOf(t.light, "signal") }
    case "reversed":
      return { ink: hexOf(t.dark, "foreground"), paper: hexOf(t.dark, "card"), signal: hexOf(t.dark, "signal") }
    case "black":
      return { ink: "#000000", paper: "knockout", signal: "#000000" }
    case "white":
      return { ink: "#ffffff", paper: "knockout", signal: "#ffffff" }
  }
}

/** The mark's drawing (no outer <svg>) in a variant. One-colour variants punch the paper shapes out with a mask. */
function markBody(svg: string, v: LogoVariant, t: Tokens, id: string) {
  const s = cleanSvg(svg)
  const k = inksFor(v, t)
  if (k.paper !== "knockout") return { s, body: recolor(s.inner, t, (r) => (r === "ink" ? k.ink : r === "paper" ? k.paper : k.signal)) }
  const mask = recolor(s.inner, t, (r) => (r === "paper" ? "#000" : "#fff"))
  return {
    s,
    body: `<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}">${mask}</mask></defs><rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="${k.ink}" mask="url(#${id})"/>`,
  }
}

export function markSvg(mark: string, v: LogoVariant, t: Tokens) {
  const { s, body } = markBody(mark, v, t, "knockout")
  return svgDoc(s.vb, body)
}

export function wordmarkSvg(wordmark: string, v: LogoVariant, t: Tokens) {
  const s = cleanSvg(wordmark)
  return svgDoc(s.vb, recolor(s.inner, t, () => inksFor(v, t).ink))
}

/**
 * Mark and name side by side, each placed whole (nested <svg>, nothing redrawn). The mark is 100 units tall; the name's
 * ascenders are about half the mark; the gap is a quarter of the mark, which is also the clear space.
 */
export const LOCKUP = { mark: 100, gap: 26, nameHeight: 50 }
export function lockupSvg(mark: string, wordmark: string, v: LogoVariant, t: Tokens) {
  const m = markBody(mark, v, t, "knockout-mark")
  const w = cleanSvg(wordmark)
  const nameH = LOCKUP.nameHeight
  const nameW = (w.w / w.h) * nameH
  const W = LOCKUP.mark + LOCKUP.gap + nameW
  const body =
    `<svg x="0" y="0" width="${LOCKUP.mark}" height="${LOCKUP.mark}" viewBox="${m.s.vb}">${m.body}</svg>` +
    `<svg x="${LOCKUP.mark + LOCKUP.gap}" y="${(LOCKUP.mark - nameH) / 2 + 2}" width="${nameW.toFixed(2)}" height="${nameH}" viewBox="${w.vb}">${recolor(w.inner, t, () => inksFor(v, t).ink)}</svg>`
  return svgDoc(`0 0 ${W.toFixed(2)} ${LOCKUP.mark}`, body)
}

/** The background a variant is shown on, for previews and the email signature. */
export const groundFor = (v: LogoVariant, t: Tokens) => (v === "reversed" || v === "white" ? hexOf(t.dark, "background") : hexOf(t.light, "card"))

/* ─────────────── The file list ─────────────── */

export type KitFile = { path: string; group: "logo" | "mark" | "app" | "social" | "email" | "colors"; served?: string; px?: [number, number]; note?: string }

/** Every file in the kit, with the path inside the kit and, for files the site already serves, where it serves them. */
export function kitFiles(id: string): KitFile[] {
  const f: KitFile[] = []
  for (const kind of ["lockup", "wordmark"])
    for (const v of LOGO_VARIANTS) {
      f.push({ path: `logo/${id}-${kind}-${v}.svg`, group: "logo" })
      for (const w of LOGO_WIDTHS) f.push({ path: `logo/${id}-${kind}-${v}-${w}.png`, group: "logo" })
    }
  for (const v of MARK_VARIANTS) {
    f.push({ path: `mark/${id}-mark-${v}.svg`, group: "mark" })
    for (const s of MARK_SIZES) f.push({ path: `mark/${id}-mark-${v}-${s}.png`, group: "mark" })
  }
  const app: [string, string][] = [
    ["favicon.svg", "/icon.svg"],
    ["favicon.ico", "/favicon.ico"],
    ["apple-touch-icon.png", "/apple-touch-icon.png"],
    ["icon-192.png", "/icons/icon-192.png"],
    ["icon-512.png", "/icons/icon-512.png"],
    ["icon-maskable-512.png", "/icons/icon-maskable-512.png"],
    ["icon-1024.png", "/icons/icon-1024.png"],
  ]
  for (const [p, served] of app) f.push({ path: `app/${p}`, group: "app", served })
  for (const b of BANNERS) f.push({ path: `social/${b.id}.png`, group: "social" })
  f.push({ path: "social/og-1200x630.png", group: "social", served: "/og.png" })
  f.push({ path: "email/signature-logo@2x.png", group: "email" })
  f.push({ path: "email/signature-logo@2x-transparent.png", group: "email" })
  for (const p of ["tokens.json", "tokens.css", "colors.md"]) f.push({ path: `colors/${p}`, group: "colors" })
  return f
}

/** Where a kit file sits under public/ (and so under out/ after a build). */
export const publicPath = (k: KitFile) => (k.served ? k.served.slice(1) : `${KIT_DIR}/${k.path}`)

/* ─────────────── What each generator produced, and from what ─────────────── */

export const GENERATED = "src/brand/generated.json"
export type Generated = Record<string, { from: string; sha256: string }>
export const readGenerated = (): Generated => (existsSync(GENERATED) ? JSON.parse(readFileSync(GENERATED, "utf8")) : {})
/** Records outputs (paths under public/) with the hash of the inputs they were made from. Keeps other generators' entries. */
export function recordGenerated(from: string, outputs: string[], replacePrefix?: (p: string) => boolean) {
  const g = readGenerated()
  if (replacePrefix) for (const k of Object.keys(g)) if (replacePrefix(k)) delete g[k]
  for (const p of outputs) g[p] = { from, sha256: sha256(readFileSync(`public/${p}`)) }
  const sorted = Object.fromEntries(Object.entries(g).sort(([a], [b]) => a.localeCompare(b)))
  writeFileSync(GENERATED, JSON.stringify(sorted, null, 1) + "\n")
}

/** The part of a built page that a share card or banner shows: what is inside <main>, without scripts. */
export function pageSource(route: string, out = "out") {
  const html = readFileSync(`${out}${route}index.html`, "utf8")
  const m = /<main id="main"[^>]*>([\s\S]*?)<\/main>/.exec(html)
  if (!m) throw new Error(`${route}: no <main>`)
  return m[1].replace(/<script[\s\S]*?<\/script>/g, "")
}

/** Inputs of each generator, hashed. Change any of them and the files they made are out of date. */
export const inputsOf = {
  icons: (p = activePreset()) =>
    sha256([readFileSync(`${presetDir(p)}/favicon.svg`, "utf8"), readFileSync(`${presetDir(p)}/app-icon.svg`, "utf8"), readFileSync("scripts/make-icons.ts", "utf8")].join("\0")),
  og: (route: string) => sha256([pageSource(route), readTokens().css, readFileSync("scripts/make-og.ts", "utf8")].join("\0")),
  kit: (p = activePreset()) =>
    sha256(
      [
        pageSource("/og/brand/"),
        ...BANNERS.filter((b) => b.kind !== "avatar").map((b) => pageSource(`/og/brand/${b.id}/`)),
        readTokens(p).css,
        readFileSync(`${presetDir(p)}/app-icon.svg`, "utf8"),
        readFileSync("src/brand/kit.ts", "utf8"),
        readFileSync("scripts/brand-kit-lib.ts", "utf8"),
        readFileSync("scripts/make-brand-kit.ts", "utf8"),
      ].join("\0")
    ),
}

/* ─────────────── Zip ─────────────── */

const CRC = new Uint32Array(256).map((_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
const crc32 = (b: Buffer) => {
  let c = 0xffffffff
  for (const x of b) c = CRC[(c ^ x) & 255] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

/** A plain zip (deflate), with a fixed date so the same files always make the same bytes. */
export function zip(files: { name: string; data: Buffer }[]) {
  const parts: Buffer[] = []
  const central: Buffer[] = []
  let offset = 0
  const DATE = ((2026 - 1980) << 9) | (1 << 5) | 1 // 1 January 2026
  for (const { name, data } of files) {
    const n = Buffer.from(name, "utf8")
    const packed = deflateRawSync(data, { level: 9 })
    const useStore = packed.length >= data.length
    const body = useStore ? data : packed
    const crc = crc32(data)
    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4)
    local.writeUInt16LE(0x0800, 6) // names are UTF-8
    local.writeUInt16LE(useStore ? 0 : 8, 8)
    local.writeUInt16LE(0, 10)
    local.writeUInt16LE(DATE, 12)
    local.writeUInt32LE(crc, 14)
    local.writeUInt32LE(body.length, 18)
    local.writeUInt32LE(data.length, 22)
    local.writeUInt16LE(n.length, 26)
    local.writeUInt16LE(0, 28)
    const cen = Buffer.alloc(46)
    cen.writeUInt32LE(0x02014b50, 0)
    cen.writeUInt16LE(20, 4)
    cen.writeUInt16LE(20, 6)
    cen.writeUInt16LE(0x0800, 8)
    cen.writeUInt16LE(useStore ? 0 : 8, 10)
    cen.writeUInt16LE(0, 12)
    cen.writeUInt16LE(DATE, 14)
    cen.writeUInt32LE(crc, 16)
    cen.writeUInt32LE(body.length, 20)
    cen.writeUInt32LE(data.length, 24)
    cen.writeUInt16LE(n.length, 28)
    cen.writeUInt32LE(offset, 42)
    parts.push(local, n, body)
    central.push(cen, n)
    offset += 30 + n.length + body.length
  }
  const cd = Buffer.concat(central)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(files.length, 8)
  end.writeUInt16LE(files.length, 10)
  end.writeUInt32LE(cd.length, 12)
  end.writeUInt32LE(offset, 16)
  return Buffer.concat([...parts, cd, end])
}

/** Names inside a zip, for the check. */
export function zipNames(b: Buffer) {
  const names: string[] = []
  const end = b.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]))
  let o = b.readUInt32LE(end + 16)
  const n = b.readUInt16LE(end + 10)
  for (let i = 0; i < n; i++) {
    const len = b.readUInt16LE(o + 28)
    const extra = b.readUInt16LE(o + 30)
    const comment = b.readUInt16LE(o + 32)
    names.push(b.toString("utf8", o + 46, o + 46 + len))
    o += 46 + len + extra + comment
  }
  return names
}
