// Contrast check for every pair of colours the site sets text or marks in, in every theme the preset has (light, dark,
// and the high-contrast versions). WCAG 2.2 is the rule: it fails the check. APCA lightness contrast (Lc) is printed
// beside it as a second look, flagged when under its target, never failing: APCA is the candidate for WCAG 3 and in beta.
// Reads the preset's generated tokens.ts (from its DTCG token files), or for a hand-written preset its tokens.css.
// usage: node scripts/contrast.ts [preset]
import { existsSync, readFileSync } from "node:fs"
import { apca, hexToRgb, over, parseColor, wcag, type Rgb } from "./color.ts"

const preset = process.argv[2] ?? /presets\/([\w-]+)\/brand/.exec(readFileSync("src/brand/index.ts", "utf8"))?.[1] ?? "leadersheet"
const dir = `src/brand/presets/${preset}`

/** Each theme's colours as solid sRGB, plus the alpha of the translucent ones. */
type Theme = Record<string, { rgb: Rgb; alpha: number }>
async function themes(): Promise<Record<string, Theme>> {
  const fromHex = (h: string) => ({ rgb: hexToRgb(h.slice(0, 7)), alpha: h.length > 7 ? parseInt(h.slice(7), 16) / 255 : 1 })
  if (existsSync(`${dir}/tokens.ts`)) {
    const { COLORS } = (await import(`../${dir}/tokens.ts`)) as { COLORS: Record<string, Record<string, string>> }
    return Object.fromEntries(Object.entries(COLORS).map(([t, c]) => [t, Object.fromEntries(Object.entries(c).map(([k, h]) => [k, fromHex(h)]))]))
  }
  const css = readFileSync(`${dir}/tokens.css`, "utf8")
  const block = (sel: string): Theme => {
    const m = css.match(new RegExp(sel.replace(".", "\\.") + "\\s*\\{([^}]*)\\}"))
    const out: Theme = {}
    for (const [, k, v] of (m?.[1] ?? "").matchAll(/--([\w-]+):\s*([^;]+);/g)) {
      const rgb = parseColor(v)
      if (rgb) out[k] = { rgb, alpha: 1 }
    }
    return out
  }
  return { light: block(":root"), dark: block(".dark") }
}

// [foreground, background, what it is, kind]. A background named "a+b" is token a laid over b at a's alpha (a tint).
// text: body and reading text (WCAG 4.5, APCA Lc 75). label: small caps labels, meta and grades (WCAG 4.5, Lc 60).
// mark: non-text that has to be seen: control borders, data marks, the focus ring (WCAG 3, Lc 45).
type Kind = "text" | "label" | "mark"
const PAIRS: [string, string, string, Kind][] = [
  ["foreground", "background", "ink on the page", "text"],
  ["foreground", "card", "ink on a card", "text"],
  ["foreground", "muted", "ink on a muted fill (picked choice, banner)", "text"],
  ["foreground", "accent", "ink on the hover fill", "text"],
  ["foreground", "ok-tint+card", "ink in a right-answer banner", "text"],
  ["card-foreground", "card", "card text", "text"],
  ["popover-foreground", "popover", "search and dialogs", "text"],
  ["secondary-foreground", "secondary", "secondary buttons", "text"],
  ["accent-foreground", "accent", "hovered rows", "text"],
  ["primary-foreground", "primary", "the ink button", "text"],
  ["muted-foreground", "background", "labels on the page", "label"],
  ["muted-foreground", "card", "labels on a card", "label"],
  ["muted-foreground", "muted", "labels on a muted fill", "label"],
  ["signal-text", "background", "pink as small text on the page", "label"],
  ["signal-text", "card", "pink as small text on a card", "label"],
  ["signal-foreground", "signal", "text on a pink fill", "label"],
  ["signal-2-foreground", "signal-2", "text on the lime", "label"],
  ["ok", "background", "a right answer's word on the page", "label"],
  ["ok", "card", "a right answer's word on a card", "label"],
  ["ok", "ok-tint+card", "the verdict in a right-answer banner", "label"],
  ["destructive", "background", "a form error", "label"],
  ["destructive", "card", "a form error on a card", "label"],
  ["rule", "background", "control borders on the page", "mark"],
  ["rule", "card", "control borders on a card", "mark"],
  ["input", "card", "field borders", "mark"],
  ["ring", "background", "focus ring on the page", "mark"],
  ["ring", "card", "focus ring on a card", "mark"],
  ["signal", "background", "pink marks on the page", "mark"],
  ["signal", "card", "pink marks in a drawing", "mark"],
  ["ok", "card", "a right answer's check mark", "mark"],
]
const NEED = { text: 4.5, label: 4.5, mark: 3 }
// Under prefers-contrast: more, reading text and labels aim at 7:1 (WCAG AAA, Primer's high-contrast goal). Text on the
// pink fill (a bold word inside a drawing's mark) keeps 4.5: no ink reaches 7:1 on the brand pink, black gives 5.4.
const NEED_MORE = { text: 7, label: 7, mark: 3 }
const ON_BRAND_FILL = new Set(["signal"])
const LC = { text: 75, label: 60, mark: 45 }
// Translucent tints a pair can sit on: the right-answer banner is the ok colour at 10% over a card (.feedback-ok).
const TINTS: Record<string, [string, number]> = { "ok-tint": ["ok", 0.1] }

const all = await themes()
let fail = 0
let soft = 0
let n = 0
for (const [name, t] of Object.entries(all)) {
  const more = name.endsWith("-more")
  const solid = (k: string): Rgb | null => {
    const [top, under] = k.split("+")
    if (under) {
      const [tok, a] = TINTS[top]
      return t[tok] && t[under] ? over(t[tok].rgb, a, t[under].rgb) : null
    }
    return t[k] && t[k].alpha === 1 ? t[k].rgb : null
  }
  console.log(`\n${preset} ${name}${more ? " (prefers-contrast: more)" : ""}`)
  for (const [a, b, what, kind] of PAIRS) {
    const fg = solid(a)
    const bg = solid(b)
    if (!fg || !bg) continue
    n++
    const r = wcag(fg, bg)
    const lc = Math.abs(apca(fg, bg))
    const need = (more && !ON_BRAND_FILL.has(b) ? NEED_MORE : NEED)[kind]
    const ok = r >= need
    const lcOk = lc >= LC[kind]
    if (!ok) fail++
    if (!lcOk) soft++
    console.log(
      `  ${ok ? "pass" : "FAIL"}  ${r.toFixed(2).padStart(5)} ≥ ${String(need).padEnd(3)}  Lc ${lc.toFixed(0).padStart(3)}${lcOk ? "  " : " ·"}  ${what} (${a} on ${b})`
    )
  }
}
console.log(`\n${n} pairs in ${Object.keys(all).length} themes. WCAG 2.2: ${fail ? `${fail} below` : "all pass"}. APCA second look: ${soft} under target (marked ·).`)
process.exit(fail ? 1 : 0)
