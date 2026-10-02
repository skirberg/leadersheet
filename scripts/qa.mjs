// One-command QA for the exported site. Run `npm run build` first, then `node scripts/qa.mjs`.
// Checks every page at 375 px and 1280 px in light and dark: crashes, horizontal overflow, and axe (WCAG 2.1 AA).
import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative } from "node:path"
import { launch } from "./chrome.mjs"
import { serve } from "./serve.mjs"

const routes = []
;(function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f)
    if (statSync(p).isDirectory()) {
      if (!f.startsWith("_")) walk(p)
    } else if (f === "index.html") routes.push("/" + relative("out", dir).replace(/\\/g, "/") + (dir === "out" ? "" : "/"))
  }
})("out")
routes.sort()
const axe = readFileSync("node_modules/axe-core/axe.min.js", "utf8")

const srv = await serve()
const { page, close } = await launch()
const problems = []
let checks = 0
for (const scheme of ["light", "dark"]) {
  await page.media({ scheme })
  for (const width of [375, 1280]) {
    await page.size(width, 900, { mobile: width < 768 })
    for (const r of routes.map((x) => x.replace("//", "/"))) {
      await page.go(srv.url + r, 900)
      const res = await page.eval(`(async () => {
        const de = document.documentElement
        const crash = document.body.innerText.includes("couldn’t load") || document.body.innerText.includes("Application error")
        const overflow = de.scrollWidth > de.clientWidth + 1
        ${width === 1280 ? axe + `
        const a = await axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } })
        const v = a.violations.map((x) => x.id + " (" + x.nodes.length + ")")` : "const v = []"}
        return { crash, overflow, v }
      })()`)
      checks++
      const tag = `${scheme} ${width}px ${r}`
      if (!res) problems.push(`${tag}: page did not answer`)
      else {
        if (res.crash) problems.push(`${tag}: crashed`)
        if (res.overflow) problems.push(`${tag}: horizontal overflow`)
        for (const v of res.v) problems.push(`${tag}: axe ${v}`)
      }
    }
  }
}
await close()
srv.close()
console.log(`${routes.length} pages, ${checks} checks.`)
if (problems.length) {
  console.log(problems.join("\n"))
  process.exit(1)
} else console.log("All clear: no crashes, no overflow, no axe violations.")
