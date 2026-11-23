// Renders the share images from the current build. Run `npm run build` first.
// public/og.png from /og/, one card per sheet from /og/sheet/<id>/, one per framework from /og/framework/<id>/, one per
// quiz result from /og/result/<game>/<id>/, and the cards of single pages (every game, Today's call, Practice and the rest)
// from /og/card/<id>/.
import { mkdirSync, readdirSync, statSync, writeFileSync, copyFileSync } from "node:fs"
import { join } from "node:path"
import { launch } from "./chrome.ts"
import { serve } from "./serve.ts"
import { inputsOf, recordGenerated } from "./brand-kit-lib.ts"

const cards = [["/og/", "public/og.png"]]
try {
  for (const id of readdirSync("out/og/sheet")) if (statSync(join("out/og/sheet", id)).isDirectory()) cards.push([`/og/sheet/${id}/`, `public/og/sheet-${id}.png`])
} catch {}
try {
  for (const id of readdirSync("out/og/framework")) if (statSync(join("out/og/framework", id)).isDirectory()) cards.push([`/og/framework/${id}/`, `public/og/framework-${id}.png`])
} catch {}
try {
  for (const id of readdirSync("out/og/card")) if (statSync(join("out/og/card", id)).isDirectory()) cards.push([`/og/card/${id}/`, `public/og/${id}.png`])
} catch {}
const base = "out/og/result"
try {
  for (const game of readdirSync(base)) {
    if (!statSync(join(base, game)).isDirectory()) continue
    for (const id of readdirSync(join(base, game))) if (statSync(join(base, game, id)).isDirectory()) cards.push([`/og/result/${game}/${id}/`, `public/og/${game}-${id}.png`])
  }
} catch {}
mkdirSync("public/og", { recursive: true })
mkdirSync("out/og", { recursive: true })
const srv = await serve()
const { page, close } = await launch()
await page.size(1200, 630)
await page.media({ scheme: "light" })
for (const [path, out] of cards) {
  await page.go(srv.url + path, 1800)
  writeFileSync(out, await page.png())
  copyFileSync(out, out.replace(/^public/, "out"))
  console.log("wrote", out)
}
await close()
srv.close()
// GitHub's social preview (1280 x 640, uploaded in the repository's settings) is the site's card on the card's own paper.
{
  const sharp = (await import("sharp")).default
  const og = sharp("public/og.png")
  const { data } = await og.clone().extract({ left: 0, top: 0, width: 1, height: 1 }).raw().toBuffer({ resolveWithObject: true })
  await og.extend({ top: 5, bottom: 5, left: 40, right: 40, background: { r: data[0], g: data[1], b: data[2] } }).png().toFile("docs/social-preview.png")
  console.log("wrote docs/social-preview.png")
}
// Each card is recorded with the hash of the page it was drawn from, so `npm run brand:check` fails when a page's
// words or drawing change and its card does not.
const g = cards.map(([path, out]) => [inputsOf.og(path), out.replace(/^public\//, "")])
for (const from of new Set(g.map(([f]) => f))) recordGenerated(from, g.filter(([f]) => f === from).map(([, o]) => o))
