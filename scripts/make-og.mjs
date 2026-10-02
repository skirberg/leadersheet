// Renders public/og.png from the /og/ page of the current build. Run `npm run build` first.
import { writeFileSync, copyFileSync } from "node:fs"
import { launch } from "./chrome.mjs"
import { serve } from "./serve.mjs"

const srv = await serve()
const { page, close } = await launch()
await page.size(1200, 630)
await page.media({ scheme: "light" })
await page.go(`${srv.url}/og/`, 2500)
writeFileSync("public/og.png", await page.png())
copyFileSync("public/og.png", "out/og.png")
console.log("wrote public/og.png")
await close()
srv.close()
