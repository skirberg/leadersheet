// Renders the active brand's favicon and app icons.
// usage: node scripts/make-icons.mjs <preset>   (default: leadersheet)
import { copyFileSync, readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { launch } from "./chrome.mjs"

const preset = process.argv[2] ?? "leadersheet"
const dir = `src/brand/presets/${preset}`
copyFileSync(`${dir}/favicon.svg`, "src/app/icon.svg")
const svg = readFileSync(`${dir}/app-icon.svg`, "utf8")
const html = `data:text/html,${encodeURIComponent(`<!doctype html><body style="margin:0">${svg.replace("<svg", '<svg style="display:block;width:100vw;height:100vh"')}</body>`)}`
mkdirSync("public/icons", { recursive: true })
const { page, close } = await launch()
for (const [size, out] of [
  [180, "src/app/apple-icon.png"],
  [192, "public/icons/icon-192.png"],
  [512, "public/icons/icon-512.png"],
]) {
  await page.size(size, size)
  await page.go(html, 400)
  writeFileSync(out, await page.png())
  console.log("wrote", out)
}
await close()
