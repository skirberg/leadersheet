// Fails if the built site uses a word the brand's voice never uses (BRAND.never in the active preset), or a line that
// was rejected. Reads the text people and answer engines read: every page's HTML, minus tags and scripts, and llms.txt,
// plus the source of the copy that only appears once someone plays (quizzes, Team math, Your sheet), which is not in
// the HTML. Run after `npm run build`; `npm run check` runs it.
import { readFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"

const active = /presets\/([\w-]+)\/brand/.exec(readFileSync("src/brand/index.ts", "utf8"))?.[1] ?? "leadersheet"
const { BRAND } = (await import(`../src/brand/presets/${active}/brand.ts`)) as { BRAND: { never?: string[] } }
const never = BRAND.never ?? []
// Lines that were rejected and must not come back anywhere on the site (the hero line rejected on 6 November 2026).
const REJECTED = ["built so you can move it"]

const files: string[] = []
;(function walk(dir: string) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f)
    if (statSync(p).isDirectory()) {
      if (!f.startsWith("_")) walk(p)
    } else if (f.endsWith(".html") || f.endsWith(".txt")) files.push(p)
  }
})("out")

const text = (p: string) => {
  // A struck-through example marked data-never (the "don't" lines on /brand/) quotes a banned word on purpose; the
  // page's data file (index.txt) carries the same example as {"data-never":"","children":"..."}.
  const raw = readFileSync(p, "utf8").replace(/"data-never":"","children":"[^"]*"/g, " ")
  if (!p.endsWith(".html")) return raw
  return raw
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<s data-never[^>]*>[\s\S]*?<\/s>/g, " ")
    .replace(/<[^>]+>/g, " ")
}

// Copy that renders only in the browser, after a click: read from the source.
const BROWSER_COPY = ["src/data/games.ts", "src/data/decide.ts", "src/data/cases.ts", "src/lib/team-math.ts", "src/lib/sheet.ts", "src/components/play", "src/components/sheet", "src/components/learn"]
const sources: string[] = []
for (const p of BROWSER_COPY) {
  if (!statSync(p).isDirectory()) sources.push(p)
  else for (const f of readdirSync(p)) if (/\.tsx?$/.test(f)) sources.push(join(p, f))
}

const hits: string[] = []
for (const p of [...files.filter((f) => !f.includes("/__next") && !/\/[a-f0-9]{32}\.txt$/.test(f)), ...sources]) {
  const t = p.startsWith("out") ? text(p) : readFileSync(p, "utf8")
  for (const line of REJECTED) {
    const i = t.toLowerCase().indexOf(line)
    if (i >= 0) hits.push(`${p}: rejected line "${t.slice(Math.max(0, i - 30), i + line.length + 10).replace(/\s+/g, " ").trim()}"`)
  }
  for (const w of never) {
    const m = new RegExp(`\\b${w.replace(/-/g, "[- ]")}\\w*`, "i").exec(t)
    if (m) hits.push(`${p}: "${m[0]}" (${t.slice(Math.max(0, m.index - 40), m.index + 40).replace(/\s+/g, " ").trim()})`)
  }
}
// Sentence case (DESIGN.md, "Type", 22 November 2026). No style sets text in capitals, and no word on a page or in
// browser-only copy is typed in capitals unless it is an acronym on this list. Add an acronym here, never a word.
const ACRONYMS = new Set(["ABI", "BATNA", "CEO", "CMYK", "CRM", "CSP", "CSS", "GLOBE", "GROW", "HBR", "HBS", "HSTS", "HTML", "JSON", "MPS", "PNG", "RGB", "SEO", "SIL", "SPLIT", "SVG", "WCAG", "ZOPA"])
const CAPS_WORD = /\b[A-Z][A-Z’'-]*[A-Z]\b/g
const capsIn = (t: string) => [...t.matchAll(CAPS_WORD)].map((m) => m[0]).filter((w) => w.length >= 3 && !ACRONYMS.has(w))
const styled: string[] = []
;(function walk(dir: string) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f)
    if (statSync(p).isDirectory()) walk(p)
    else if (/\.(tsx?|css)$/.test(f)) {
      const m = /(?<![\w-])uppercase(?![\w-])|text-transform:\s*uppercase|textTransform:\s*["']uppercase|\.toUpperCase\(\)/.exec(readFileSync(p, "utf8"))
      if (m) styled.push(`${p}: sets text in capitals (${m[0]})`)
    }
  }
})("src")
hits.push(...styled)
for (const p of [...files.filter((f) => f.endsWith(".html")), ...sources]) {
  // In source, only the text between JSX tags (an SVG label, a line of copy); the HTML is read whole.
  const t = p.startsWith("out") ? text(p) : [...readFileSync(p, "utf8").matchAll(/>([^<>{}=;()]*)</g)].map((m) => m[1]).join(" ")
  const words = [...new Set(capsIn(t))]
  if (words.length) hits.push(`${p}: in capitals: ${words.slice(0, 6).join(", ")}`)
}

console.log(`${files.length} built files and ${sources.length} source files of browser-only copy read for ${never.length} words the voice never uses (${never.join(", ")}), ${REJECTED.length} rejected line and words in capitals (${ACRONYMS.size} acronyms allowed).`)
if (hits.length) {
  console.log(hits.join("\n"))
  process.exit(1)
} else console.log("All clear: none of them appear.")
