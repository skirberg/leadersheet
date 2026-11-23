// Draws the brand kit into public/brand/ from the active preset. Run after `npm run build` (it reads the built pages);
// `npm run brand:kit` builds, renders the icons and share cards, then runs this.
//   logo/    the lockup (mark and name) and the wordmark: color, reversed, black, white; SVG and PNG 512/1024/2048 wide
//   mark/    the mark: color, reversed, black, white, tile; SVG and PNG 64 to 1024
//   social/  avatars and banners (src/brand/kit.ts lists sizes and safe areas), drawn from the home page's lesson cards
//   email/   the lockup at 400 px wide for a 200 px signature, on white and transparent
//   colors/  tokens.json, tokens.css and colors.md
// The app icons and the site's share card are not copied: the kit points at the files the site serves (kit.json), so the
// kit and the home-screen icon can never disagree. kit.json and kit.zip are packed on every build (scripts/brand-pack.ts).
// Nothing here is redrawn: the logo files are the preset's LogoMark and Wordmark as the site renders them, recoloured.
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { dirname } from "node:path"
import { launch } from "./chrome.ts"
import { serve } from "./serve.ts"
import {
  activePreset, brandOf, readTokens, sourceArt, markSvg, wordmarkSvg, lockupSvg, kitFiles, publicPath, recordGenerated, inputsOf,
  hexOf, parseColor, toHex, rgbToOklch, cmykApprox, contrast, COLOR_ROLES, CONTRAST_PAIRS, presetDir,
} from "./brand-kit-lib.ts"
import { BANNERS, KIT_DIR, LOGO_VARIANTS, LOGO_WIDTHS, MARK_SIZES } from "../src/brand/kit.ts"
import { pack } from "./brand-pack.ts"

const preset = activePreset()
const BRAND = await brandOf(preset)
const id = BRAND.id
const t = readTokens(preset)
const art = sourceArt()
const appIcon = readFileSync(`${presetDir(preset)}/app-icon.svg`, "utf8")

rmSync(`public/${KIT_DIR}`, { recursive: true, force: true })
const written: string[] = []
const write = (rel: string, data: string | Buffer) => {
  const p = `public/${KIT_DIR}/${rel}`
  mkdirSync(dirname(p), { recursive: true })
  writeFileSync(p, data)
  written.push(`${KIT_DIR}/${rel}`)
}

// Vectors
const vectors: Record<string, string> = {}
for (const v of LOGO_VARIANTS) {
  vectors[`logo/${id}-lockup-${v}`] = lockupSvg(art.mark, art.wordmark, v, t)
  vectors[`logo/${id}-wordmark-${v}`] = wordmarkSvg(art.wordmark, v, t)
  vectors[`mark/${id}-mark-${v}`] = markSvg(art.mark, v, t)
}
vectors[`mark/${id}-mark-tile`] = appIcon.trim() + "\n"
for (const [name, svg] of Object.entries(vectors)) write(`${name}.svg`, svg)

// Rasters
const page = (svg: string, ground = "transparent") =>
  `data:text/html,${encodeURIComponent(`<!doctype html><body style="margin:0;background:${ground}">${svg.replace("<svg", '<svg style="display:block;width:100vw;height:100vh"')}</body>`)}`
const aspect = (svg: string) => {
  const [, , w, h] = /viewBox="([^"]+)"/.exec(svg)![1].split(/[\s,]+/).map(Number)
  return h / w
}

const srv = await serve()
const { page: tab, close } = await launch()
const transparent = () => tab.send("Emulation.setDefaultBackgroundColorOverride", { color: { r: 0, g: 0, b: 0, a: 0 } })
const opaque = () => tab.send("Emulation.setDefaultBackgroundColorOverride", {})
await tab.media({ scheme: "light" })
await transparent()

async function render(svg: string, w: number, h: number, out: string, ground?: string) {
  await tab.size(w, h)
  await tab.go(page(svg, ground), 250)
  write(out, await tab.png())
}

for (const v of LOGO_VARIANTS) {
  for (const kind of ["lockup", "wordmark"]) {
    const svg = vectors[`logo/${id}-${kind}-${v}`]
    for (const w of LOGO_WIDTHS) await render(svg, w, Math.round(w * aspect(svg)), `logo/${id}-${kind}-${v}-${w}.png`)
  }
}
for (const v of [...LOGO_VARIANTS, "tile"]) {
  const svg = vectors[`mark/${id}-mark-${v}`]
  for (const s of MARK_SIZES) await render(svg, s, s, `mark/${id}-mark-${v}-${s}.png`)
}
console.log(`wrote ${written.length} logo and mark files`)

// Email signature: the lockup at 400 px wide, shown at 200.
const lockup = vectors[`logo/${id}-lockup-color`]
const eh = Math.round(400 * aspect(lockup))
await render(lockup, 400, eh, "email/signature-logo@2x-transparent.png")
await opaque()
await render(lockup, 400, eh, "email/signature-logo@2x.png", hexOf(t.light, "card"))

// Social: avatars are the app icon (it reads as a circle too); banners are pages in the build.
for (const b of BANNERS) {
  if (b.kind === "avatar") {
    await render(appIcon, b.w, b.h, `social/${b.id}.png`)
    continue
  }
  await tab.size(b.w, b.h)
  await tab.media({ scheme: b.theme })
  await tab.go(`${srv.url}/og/brand/${b.id}/`, 1800)
  write(`social/${b.id}.png`, await tab.png())
}
await close()
srv.close()

// Colours
const rows = COLOR_ROLES.filter(([n]) => t.light[n] && parseColor(t.light[n]))
const swatch = (name: string, mode: "light" | "dark") => {
  const c = parseColor(t[mode][name])!
  return { name, value: t[mode][name], hex: toHex(c), rgb: c.map((x) => Math.round(x * 255)), oklch: rgbToOklch(c), cmykApprox: cmykApprox(c) }
}
// The preset's own token source: its DTCG files when it has them (the full resolved set is /tokens.json), else its CSS.
const dtcg = existsSync(`${presetDir(preset)}/tokens/resolver.json`)
const source = dtcg ? `${presetDir(preset)}/tokens/` : `${presetDir(preset)}/tokens.css`
const tokensJson = {
  name: BRAND.name,
  source,
  note: "CMYK values are a naive approximation for briefing a printer, not a colour-managed conversion.",
  light: Object.fromEntries(rows.map(([n, role]) => [n, { role, ...swatch(n, "light") }])),
  dark: Object.fromEntries(rows.map(([n, role]) => [n, { role, ...swatch(n, "dark") }])),
  contrast: (["light", "dark"] as const).flatMap((mode) =>
    CONTRAST_PAIRS.filter(([a, b]) => parseColor(t[mode][a] ?? "") && parseColor(t[mode][b] ?? "")).map(([a, b, need, what]) => {
      const r = contrast(parseColor(t[mode][a])!, parseColor(t[mode][b])!)
      return { mode, text: a, on: b, use: what, ratio: Number(r.toFixed(2)), needs: need, passes: r >= need }
    })
  ),
}
write("colors/tokens.json", JSON.stringify(tokensJson, null, 2) + "\n")
write("colors/tokens.css", t.css)
const md = [
  `# ${BRAND.name} colours`,
  "",
  `From \`${source}\`${dtcg ? " (DTCG 2025.10 token files; every theme, high contrast included, is resolved at /tokens.json)" : ""}. CMYK is a naive approximation (no print profile); ask the printer to match the HEX.`,
  "",
  "| Name | Role | Light HEX | Light RGB | Light OKLCH | Light CMYK (approx.) | Dark HEX |",
  "|---|---|---|---|---|---|---|",
  ...rows.map(([n, role]) => {
    const l = swatch(n, "light"), d = swatch(n, "dark")
    return `| ${n} | ${role} | ${l.hex} | ${l.rgb.join(", ")} | ${l.oklch} | ${l.cmykApprox.join(", ")} | ${d.hex} |`
  }),
  "",
  "## Contrast (WCAG 2.1)",
  "",
  "| Mode | Pair | Ratio | Needs |",
  "|---|---|---|---|",
  ...tokensJson.contrast.map((c) => `| ${c.mode} | ${c.text} on ${c.on} (${c.use}) | ${c.ratio.toFixed(2)} | ${c.needs} ${c.passes ? "pass" : "FAIL"} |`),
  "",
].join("\n")
write("colors/colors.md", md)

// The build copy, so a check run without a rebuild sees the same files.
for (const p of written) {
  mkdirSync(dirname(`out/${p}`), { recursive: true })
  copyFileSync(`public/${p}`, `out/${p}`)
}
const expected = kitFiles(id).filter((k) => !k.served).map(publicPath)
const missing = expected.filter((p) => !written.includes(p))
if (missing.length) throw new Error(`the kit list names files this script did not write: ${missing.join(", ")}`)
recordGenerated(inputsOf.kit(preset), written, (p) => p.startsWith(`${KIT_DIR}/`))
console.log(`wrote ${written.length} files to public/${KIT_DIR}/ and recorded them in src/brand/generated.json`)
await pack()
