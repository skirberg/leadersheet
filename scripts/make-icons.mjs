// Renders the active brand's favicons and app icons into public/.
// usage: node scripts/make-icons.mjs <preset>   (default: leadersheet)
//   public/icon.svg               the favicon, with its dark-mode block (Chrome, Firefox, Edge)
//   public/favicon.ico            16, 32 and 48 px from the same drawing (Safari, bookmarks, search results, link previews)
//   public/apple-touch-icon.png   180 px app icon (iOS home screen, iMessage, Safari)
//   public/icons/icon-192.png, icon-512.png   web app manifest
import { copyFileSync, readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { launch } from "./chrome.mjs"

const preset = process.argv[2] ?? "leadersheet"
const dir = `src/brand/presets/${preset}`
mkdirSync("public/icons", { recursive: true })
copyFileSync(`${dir}/favicon.svg`, "public/icon.svg")

const page_ = (svg) =>
  `data:text/html,${encodeURIComponent(
    `<!doctype html><body style="margin:0;background:transparent">${svg.replace("<svg", '<svg style="display:block;width:100vw;height:100vh"')}</body>`
  )}`

const { page, close } = await launch()
await page.media({ scheme: "light" })

// App icons: full-bleed square on paper.
const app = page_(readFileSync(`${dir}/app-icon.svg`, "utf8"))
for (const [size, out] of [
  [180, "public/apple-touch-icon.png"],
  [192, "public/icons/icon-192.png"],
  [512, "public/icons/icon-512.png"],
]) {
  await page.size(size, size)
  await page.go(app, 400)
  writeFileSync(out, await page.png())
  console.log("wrote", out)
}

// favicon.ico: the favicon drawing on a transparent background, one PNG per size.
await page.send("Emulation.setDefaultBackgroundColorOverride", { color: { r: 0, g: 0, b: 0, a: 0 } })
const fav = page_(readFileSync(`${dir}/favicon.svg`, "utf8"))
const pngs = []
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
