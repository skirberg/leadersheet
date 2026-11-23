// One-command QA for the exported site. Run `npm run build` first, then `node scripts/qa.ts`.
// Checks every page at 320, 375, 768, 1024 and 1280 px in light and dark: crashes, horizontal overflow, blocks off the page
// grid (DESIGN.md, Grid); axe (WCAG 2.1 AA) at 1280. Each page is checked once it has loaded, its fonts are in and its
// code has gone quiet, with entrance animations at their end: the page a reader reads, on any machine.
import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative } from "node:path"
import { launch } from "./chrome.ts"
import { serve } from "./serve.ts"

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
// The share-card sources under /og/ are 1200 x 630 pictures, not pages: nothing links them, the sitemap leaves them out,
// robots.txt and noindex keep them out of search, and npm run previews skips them. npm run brand:check compares each with
// its PNG. Held to page rules here, they were half of every run (156 of 299 pages on 22 November 2026).
routes.splice(0, routes.length, ...routes.filter((r) => !r.startsWith("/og/")))
// QA_ONLY=/today/class/,/play/rewind/ checks just those pages (after a fix to one page, say); unset, every page
const only = process.env.QA_ONLY?.split(",").map((s) => s.trim()).filter(Boolean)
if (only?.length) routes.splice(0, routes.length, ...routes.filter((r) => only.includes(r.replace("//", "/"))))
const axe = readFileSync("node_modules/axe-core/axe.min.js", "utf8")

const srv = await serve()
const { page, close } = await launch()
const problems = []
let checks = 0
for (const scheme of ["light", "dark"]) {
  await page.media({ scheme })
  for (const width of [320, 375, 768, 1024, 1280]) {
    await page.size(width, 900, { mobile: width < 768 })
    console.log(`${scheme} ${width}px: ${routes.length} pages…`)
    for (const r of routes.map((x) => x.replace("//", "/"))) {
      await page.go(srv.url + r, 900)
      // A page that never answers (a promise that never settles) is a finding, not a reason for QA to wait forever.
      let timer
      const res = await Promise.race([new Promise((ok) => (timer = setTimeout(() => ok("timeout"), 60_000))), page.eval(`(async () => {
        // Fonts in and the page's code idle (hydration done), then every entrance animation (a card's rise, a fade)
        // jumped to its end. A pulse that never ends has no end to jump to and stays as it is.
        await document.fonts.ready
        await new Promise((ok) => requestIdleCallback(() => ok(), { timeout: 3000 }))
        for (const a of document.getAnimations()) {
          try {
            a.finish()
          } catch {}
        }
        const de = document.documentElement
        const crash = document.body.innerText.includes("couldn’t load") || document.body.innerText.includes("Application error")
        // Sideways scroll: the document or the body wider than the screen, or a sideways scroll that moves the page.
        scrollTo(9999, scrollY)
        const moved = scrollX
        scrollTo(0, scrollY)
        const overflow = Math.max(de.scrollWidth, document.body.scrollWidth) > de.clientWidth || moved > 0
        // The page grid (DESIGN.md, Grid): every block placed with a span-* class, and the header bar, must start on a
        // column line and end on one. Lines come from the page's own frame: its padding is the margin, and the columns
        // are equal with --gutter between them.
        const offGrid = []
        const frame = document.querySelector("main .page")
        if (!frame) offGrid.push("no page grid on this page")
        if (frame) {
          const cs = getComputedStyle(frame)
          const r = frame.getBoundingClientRect()
          const x0 = r.left + parseFloat(cs.paddingLeft)
          const w = r.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
          const n = parseInt(cs.getPropertyValue("--cols"))
          const g = parseFloat(cs.getPropertyValue("--gutter"))
          const col = (w - (n - 1) * g) / n
          const starts = Array.from({ length: n }, (_, i) => x0 + i * (col + g))
          const ends = starts.map((x) => x + col)
          const near = (v, lines) => lines.some((l) => Math.abs(v - l) < 1.5)
          const SPAN = /^span-(wide|head|center|rail|main|read)$/
          const blocks = [...document.querySelectorAll("main [class*='span-']")].filter((el) => [...el.classList].some((c) => SPAN.test(c)))
          blocks.push(...document.querySelectorAll("header.frame > div"))
          for (const el of blocks) {
            const b = el.getBoundingClientRect()
            if (b.width < 1 || b.height < 1 || getComputedStyle(el).display === "none") continue
            if (!near(b.left, starts) || !near(b.right, ends))
              offGrid.push((el.id || el.tagName.toLowerCase()) + "." + ([...el.classList].find((c) => SPAN.test(c)) ?? "bar") + " " + Math.round(b.left) + "-" + Math.round(b.right))
          }
        }
        ${width === 1280 ? axe + `
        // Check colours at rest: a scroll reveal caught mid-fade at the window edge is not what anyone reads.
        const still = document.createElement("style")
        still.textContent = ".reveal{animation:none!important;opacity:1!important;transform:none!important}"
        document.head.appendChild(still)
        const a = await axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } })
        const v = a.violations.map((x) => x.id + " (" + x.nodes.length + ")")` : "const v = []"}
        return { crash, overflow, v, offGrid }
      })()`)])
      // the page answered: drop its timer, or the last one keeps Node (and npm run check) waiting a minute after the report
      clearTimeout(timer)
      checks++
      const tag = `${scheme} ${width}px ${r}`
      if (res === "timeout") problems.push(`${tag}: page did not answer in 60 s`)
      else if (!res) problems.push(`${tag}: page did not answer`)
      else {
        if (res.crash) problems.push(`${tag}: crashed`)
        if (res.overflow) problems.push(`${tag}: scrolls sideways`)
        if (res.offGrid?.length) problems.push(`${tag}: off the page grid: ${res.offGrid.slice(0, 4).join(", ")}${res.offGrid.length > 4 ? " …" : ""}`)
        if (!Array.isArray(res.v)) problems.push(`${tag}: axe did not run (${JSON.stringify(res).slice(0, 120)})`)
        else for (const v of res.v) problems.push(`${tag}: axe ${v}`)
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
} else console.log("All clear: no crashes, no sideways scroll, nothing off the grid, no axe violations.")
