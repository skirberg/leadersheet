// Packs the brand kit on every build (npm's prebuild): public/brand/kit.json lists every file in the kit with its size,
// pixel size and sha256, and public/brand/kit.zip holds them all in the kit's folders with a README. Both are made from
// the files the site serves at that moment, so the zip, the manifest and the live icons always agree. No browser needed;
// the drawings themselves come from `npm run brand:kit`. Both files are build output and stay out of git.
import { execFileSync } from "node:child_process"
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { pathToFileURL } from "node:url"
import { activePreset, brandOf, kitFiles, publicPath, sha256, zip, inputsOf, readGenerated } from "./brand-kit-lib.ts"
import { KIT_DIR, LOCKUP_RULES } from "../src/brand/kit.ts"
import { pngSize } from "./png.ts"

export async function pack({ quiet = false } = {}) {
  const preset = activePreset()
  const BRAND = await brandOf(preset)
  const files = kitFiles(BRAND.id)
  const present = files.filter((k) => existsSync(`public/${publicPath(k)}`))
  const missing = files.filter((k) => !present.includes(k))
  if (missing.length) console.warn(`brand kit: ${missing.length} files missing (${missing.slice(0, 3).map((k) => k.path).join(", ")}…). Run npm run brand:kit.`)
  // The drawing changed but the icons were not redrawn: say so on every build; brand:check fails on it in CI.
  const g = readGenerated()
  if (g["icon.svg"] && g["icon.svg"].from !== inputsOf.icons(preset)) console.warn("brand kit: the preset's favicon or app icon changed since the icons were drawn. Run npm run brand:kit.")

  let commit = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7)
  if (!commit) {
    try {
      commit = execFileSync("git", ["rev-parse", "--short", "HEAD"], { stdio: ["ignore", "pipe", "ignore"] }).toString().trim()
    } catch {
      commit = "local"
    }
  }
  const date = new Date().toISOString().slice(0, 10)
  const root = `${BRAND.id}-brand-kit`
  const entries = present.map((k) => {
    const data = readFileSync(`public/${publicPath(k)}`)
    const px = k.path.endsWith(".png") ? pngSize(data) : null
    return { k, data, meta: { path: k.path, url: `/${publicPath(k)}`, bytes: data.length, sha256: sha256(data), ...(px ? { px: [px.width, px.height] } : {}) } }
  })

  const readme = [
    `${BRAND.name} brand kit`,
    `${BRAND.url}/brand/   version ${commit}, ${date}`,
    "",
    "logo/    The lockup (mark and name) and the wordmark alone. color on light grounds, reversed on dark,",
    "         black and white for one-colour use. SVG is the master; PNGs are 512, 1024 and 2048 px wide.",
    "mark/    The mark alone in the same variants, plus tile (the app icon). SVG and PNG 64 to 1024 px.",
    "app/     The icons the site serves today: favicon, apple-touch-icon, manifest icons, 1024 px.",
    "social/  Avatars, banners for X, LinkedIn, YouTube and GitHub, Instagram posts and a story. The wide",
    "         banners come in light and dark. og-1200x630.png is the site's link preview.",
    "email/   The lockup at 400 px wide for a 200 px email signature, on white and transparent.",
    "colors/  tokens.json and tokens.css (the site's own tokens), colors.md (HEX, RGB, OKLCH, CMYK approximation,",
    "         contrast ratios).",
    "",
    `Clear space: ${LOCKUP_RULES.clearSpace}`,
    `Minimum size: ${LOCKUP_RULES.minimum}`,
    "Do not stretch, recolour, outline, straighten the card or set the logo on a busy picture.",
    "",
    "Type (all SIL Open Font License 1.1, free for any use; https://openfontlicense.org):",
    "  Noticia Text      headlines         https://fonts.google.com/specimen/Noticia+Text",
    "  Instrument Sans   text, numbers     https://fonts.google.com/specimen/Instrument+Sans",
    "  Funnel Display    the wordmark      https://fonts.google.com/specimen/Funnel+Display",
    "  Martian Mono      drawing labels    https://fonts.google.com/specimen/Martian+Mono",
    "The wordmark is already outlined; you do not need the font to use it.",
    "",
    `The name, logo and share cards are not open source: see ${BRAND.url}/built/ and the repository's NOTICE.md.`,
    "kit.json, next to kit.zip on the site, lists every file with its size and sha256.",
    "",
  ].join("\n")

  const z = zip([...entries.map((e) => ({ name: `${root}/${e.k.path}`, data: e.data })), { name: `${root}/README.txt`, data: Buffer.from(readme) }])
  const kit = {
    name: BRAND.name,
    url: `${BRAND.url}/${KIT_DIR}/`,
    version: { commit, date },
    preset,
    files: entries.map((e) => e.meta),
    zip: { url: `/${KIT_DIR}/kit.zip`, bytes: z.length, sha256: sha256(z) },
  }
  mkdirSync(`public/${KIT_DIR}`, { recursive: true })
  writeFileSync(`public/${KIT_DIR}/kit.zip`, z)
  writeFileSync(`public/${KIT_DIR}/kit.json`, JSON.stringify(kit, null, 1) + "\n")
  if (!quiet) console.log(`brand kit: packed ${entries.length} files (${(z.length / 1e6).toFixed(1)} MB zip), version ${commit} ${date}`)
  return kit
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await pack()
