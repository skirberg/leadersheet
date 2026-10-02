// Renders the share images from the current build. Run `npm run build` first.
// public/og.png from /og/, and one card per quiz result from /og/result/<game>/<id>/.
import { mkdirSync, readdirSync, statSync, writeFileSync, copyFileSync } from "node:fs"
import { join } from "node:path"
import { launch } from "./chrome.mjs"
import { serve } from "./serve.mjs"

const cards = [["/og/", "public/og.png"]]
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
