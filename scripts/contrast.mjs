// Contrast check for a palette. Reads the :root and .dark blocks of a preset's tokens.css
// and prints WCAG ratios for the pairs that matter. usage: node scripts/contrast.mjs <preset>
import { readFileSync } from "node:fs"

const preset = process.argv[2] ?? "leadersheet"
const css = readFileSync(`src/brand/presets/${preset}/tokens.css`, "utf8")
const block = (sel) => {
  const m = css.match(new RegExp(sel.replace(".", "\\.") + "\\s*\\{([^}]*)\\}"))
  return Object.fromEntries([...(m?.[1] ?? "").matchAll(/--([\w-]+):\s*([^;]+);/g)].map((x) => [x[1], x[2].trim()]))
}
const hex = (v) => {
  const h = v.match(/^#([0-9a-f]{6})$/i)?.[1]
  return h ? [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) : null
}
const lum = (c) => {
  const [r, g, b] = c.map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}
const PAIRS = [
  ["foreground", "background", 4.5, "body text"],
  ["muted-foreground", "background", 4.5, "secondary text"],
  ["muted-foreground", "card", 4.5, "secondary text on cards"],
  ["primary-foreground", "primary", 4.5, "primary button"],
  ["signal-text", "background", 4.5, "signal as small text"],
  ["signal", "background", 3, "signal marks and large text"],
  ["signal-foreground", "signal", 4.5, "text on signal fills"],
  ["signal-2-foreground", "signal-2", 4.5, "text on the highlighter"],
  ["ok", "background", 4.5, "right-answer text"],
  ["rule", "background", 3, "control borders"],
]
let fail = 0
for (const [name, sel] of [["light", ":root"], [ "dark", ".dark"]]) {
  const t = block(sel)
  console.log(`\n${preset} ${name}`)
  for (const [a, b, need, what] of PAIRS) {
    const ca = hex(t[a] ?? ""), cb = hex(t[b] ?? "")
    if (!ca || !cb) { console.log(`  skip  ${a} on ${b} (not a 6-digit hex)`); continue }
    const r = ratio(ca, cb), ok = r >= need
    if (!ok) fail++
    console.log(`  ${ok ? "pass" : "FAIL"}  ${r.toFixed(2).padStart(5)} ≥ ${need}  ${what} (${a} on ${b})`)
  }
}
process.exit(fail ? 1 : 0)
