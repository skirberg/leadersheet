// Renders the active brand's favicons and app icons into public/.
// usage: node scripts/make-icons.ts <preset>   (default: leadersheet)
//   public/icon.svg               the favicon (Chrome, Firefox, Edge)
//   public/favicon.ico            16, 32 and 48 px from the same drawing (Safari, bookmarks, search results, link previews)
//   public/apple-touch-icon.png   180 px app icon (iOS home screen, iMessage, Safari)
//   public/icons/icon-192.png, icon-512.png   web app manifest
//   public/icons/icon-maskable-512.png        web app manifest, "maskable": the app icon is full-bleed with the drawing
//                                             inside the central 80% circle (scripts/brand-check.ts measures it)
//   public/icons/icon-1024.png                the brand kit and app stores
//   public/icons/shortcut-<id>.png            96 px, one per web app shortcut (long-press the installed app): the
//                                             section's own glyph from the site's navigation, white on the icon's black
// Each file is recorded in src/brand/generated.json with the hash of its sources, so `npm run brand:check` fails when
// the drawing changes and the icons do not.
import { copyFileSync, readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { launch } from "./chrome.ts"
import { inputsOf, recordGenerated } from "./brand-kit-lib.ts"

const preset = process.argv[2] ?? "leadersheet"
const dir = `src/brand/presets/${preset}`
mkdirSync("public/icons", { recursive: true })
copyFileSync(`${dir}/favicon.svg`, "public/icon.svg")

const page_ = (svg: string) =>
  `data:text/html,${encodeURIComponent(
    `<!doctype html><body style="margin:0;background:transparent">${svg.replace("<svg", '<svg style="display:block;width:100vw;height:100vh"')}</body>`
  )}`

const { page, close } = await launch()
await page.media({ scheme: "light" })

// App icons: full-bleed square on paper.
const app = page_(readFileSync(`${dir}/app-icon.svg`, "utf8"))
const APP_ICONS: [number, string][] = [
  [180, "public/apple-touch-icon.png"],
  [192, "public/icons/icon-192.png"],
  [512, "public/icons/icon-512.png"],
  [512, "public/icons/icon-maskable-512.png"],
  [1024, "public/icons/icon-1024.png"],
]
for (const [size, out] of APP_ICONS) {
  await page.size(size, size)
  await page.go(app, 400)
  writeFileSync(out, await page.png())
  console.log("wrote", out)
}

// Shortcut icons: the same black ground as the app icon, and the glyph the site's navigation uses for that section
// (lucide, read from the installed package so they match what the site draws), inside the central 60% so a launcher
// that crops to a circle keeps all of it.
const SHORTCUTS: [string, string][] = [
  ["today", "calendar-check"],
  ["learn", "book-open"],
  ["play", "gamepad-2"],
  ["practice", "dumbbell"],
]
const lucide = (name: string) =>
  [...readFileSync(`node_modules/lucide-react/dist/esm/icons/${name}.mjs`, "utf8").matchAll(/\[\s*"(\w+)",\s*\{([^}]*)\}\s*\]/g)]
    .map(([, tag, attrs]) => `<${tag} ${[...attrs.matchAll(/(\w+): "([^"]*)"/g)].filter(([, k]) => k !== "key").map(([, k, v]) => `${k}="${v}"`).join(" ")}/>`)
    .join("")
const ink = /fill="(#[0-9a-f]{3,6})"/i.exec(readFileSync(`${dir}/app-icon.svg`, "utf8"))?.[1] ?? "#000"
await page.size(96, 96)
for (const [id, glyph] of SHORTCUTS) {
  if (!lucide(glyph)) throw new Error(`lucide's ${glyph} drew nothing: its file format changed`)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="-8" y="-8" width="40" height="40" fill="${ink}"/><g transform="translate(5.4 5.4) scale(.55)" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${lucide(glyph)}</g></svg>`
  await page.go(page_(svg), 300)
  writeFileSync(`public/icons/shortcut-${id}.png`, await page.png())
  console.log(`wrote public/icons/shortcut-${id}.png`)
}

// favicon.ico: the favicon drawing on a transparent background, one PNG per size.
await page.send("Emulation.setDefaultBackgroundColorOverride", { color: { r: 0, g: 0, b: 0, a: 0 } })
const fav = page_(readFileSync(`${dir}/favicon.svg`, "utf8"))
const pngs: [number, Buffer][] = []
for (const size of [16, 32, 48]) {
  await page.size(size, size)
  await page.go(fav, 400)
  pngs.push([size, await page.png()])
}
await close()

const head = Buffer.alloc(6 + 16 * pngs.length)
head.writeUInt16LE(0, 0) // reserved
head.writeUInt16LE(1, 2) // type: icon
head.writeUInt16LE(pngs.length, 4)
let offset = head.length
pngs.forEach(([size, png], i) => {
  const e = 6 + 16 * i
  head.writeUInt8(size, e) // width
  head.writeUInt8(size, e + 1) // height
  head.writeUInt8(0, e + 2) // palette
  head.writeUInt8(0, e + 3) // reserved
  head.writeUInt16LE(1, e + 4) // planes
  head.writeUInt16LE(32, e + 6) // bits per pixel
  head.writeUInt32LE(png.length, e + 8)
  head.writeUInt32LE(offset, e + 12)
  offset += png.length
})
writeFileSync("public/favicon.ico", Buffer.concat([head, ...pngs.map(([, png]) => png)]))
console.log("wrote public/favicon.ico (16, 32, 48)")
recordGenerated(inputsOf.icons(preset), ["icon.svg", "favicon.ico", ...APP_ICONS.map(([, out]) => out.replace(/^public\//, "")), ...SHORTCUTS.map(([id]) => `icons/shortcut-${id}.png`)])
