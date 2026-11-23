// Link-preview check: every page names a share card of its own (only the home page and the missing page use the
// site's), the card exists in the build as a 1200 x 630 PNG on this site, and robots.txt lets the preview bots fetch
// it (X and LinkedIn read robots.txt before showing an image; on 19 November 2026 a Disallow on /og/ hid every card).
// Run after `npm run build`.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs"
import { join, relative } from "node:path"

const pages: string[] = []
;(function walk(dir: string) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f)
    if (statSync(p).isDirectory()) {
      if (!f.startsWith("_")) walk(p)
    } else if (f === "index.html" || f === "404.html") pages.push(p)
  }
})("out")

const robots = readFileSync("out/robots.txt", "utf8")
const disallow = [...robots.matchAll(/^Disallow:\s*(\S+)/gim)].map((m) => m[1])
const blocked = (path: string) => disallow.some((d) => path.startsWith(d))
const site = /^Sitemap:\s*(https?:\/\/[^/\s]+)/im.exec(robots)?.[1] ?? ""

const SITE_CARD = new Set(["/", "/404/", "/og/"]) // /og/ draws the site's card and is not indexed
const problems: string[] = []
const cards = new Set<string>()
let checked = 0
for (const file of pages) {
  const route = "/" + relative("out", file).replace(/index\.html$|404\.html$/, "")
  if (blocked(route)) continue // the pages that draw the cards; not shared, not indexed
  const html = readFileSync(file, "utf8")
  const og = /<meta property="og:image" content="([^"]+)"/.exec(html)?.[1]
  const tw = /<meta name="twitter:image" content="([^"]+)"/.exec(html)?.[1]
  checked++
  if (!og) {
    problems.push(`${route}: no og:image`)
    continue
  }
  if (!tw) problems.push(`${route}: no twitter:image`)
  const url = new URL(og)
  if (site && url.origin !== site) problems.push(`${route}: card is on ${url.origin}, not ${site}`)
  if (blocked(url.pathname)) problems.push(`${route}: robots.txt blocks its card ${url.pathname}`)
  // The site's card is the home page's and the missing page's. Every other page shows its own content when shared.
  if (url.pathname === "/og.png" && !SITE_CARD.has(route)) problems.push(`${route}: shares the site's card /og.png; draw it one of its own (src/components/og/)`)
  const png = join("out", url.pathname)
  if (!existsSync(png)) {
    problems.push(`${route}: card ${url.pathname} is not in the build`)
    continue
  }
  if (!cards.has(png)) {
    cards.add(png)
    const b = readFileSync(png)
    const isPng = b.subarray(1, 4).toString("latin1") === "PNG"
    const w = b.readUInt32BE(16),
      h = b.readUInt32BE(20)
    if (!isPng || w !== 1200 || h !== 630) problems.push(`${url.pathname}: ${isPng ? `${w} x ${h}` : "not a PNG"}, expected a 1200 x 630 PNG`)
  }
}
console.log(`${checked} pages, ${cards.size} distinct share cards, robots.txt blocks ${disallow.join(" and ") || "nothing"}.`)
if (problems.length) {
  console.log(problems.join("\n"))
  process.exit(1)
} else console.log("All clear: every page names a 1200 x 630 card of its own that is in the build and that preview bots may fetch.")
