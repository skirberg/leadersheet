// Checks the decision cases against the course: one per lesson, every choice lands on a real framework
// row, each case has a strong call, and every model key a choice writes is one that lesson's model reads.
// Run with `node scripts/cases.ts`; `npm run check` runs it too.
import { readFileSync } from "node:fs"
import { CASES } from "../src/data/cases.ts"
import { TALKS, talkEnding } from "../src/data/rewind.ts"

type Course = { sessions: { id: string; title: string; lab: string }[]; frameworks: { id: string; rows: [string, string][] }[] }
const course = JSON.parse(readFileSync(new URL("../src/data/course.json", import.meta.url), "utf8")) as Course

// The lab state each model reads (src/components/labs). A case may only write these.
const LAB_KEYS: Record<string, string[]> = {
  ei: ["ei", "ei2"],
  structure: ["st", "nt"],
  culture: ["cu"],
  kotter: ["kt"],
  team: ["tn", "tw-pod", "tw-take", "tw-help"],
  conflict: ["tki"],
  decision: ["k12", "k12n"],
  motivation: ["jcm", "ex"],
  ladder: ["ld", "fx"],
  energy: ["en"],
  trust: ["abi"],
  negotiate: ["zopa"],
  coach: ["cont"],
  network: ["net"],
  cultures: ["cm-k", "cm"],
  self: ["week"],
}

const problems: string[] = []
const fw = new Map(course.frameworks.map((f) => [f.id, f]))
for (const s of course.sessions) {
  const c = CASES.filter((x) => x.sheet === s.id)
  if (c.length !== 1) {
    problems.push(`${s.id} ${s.title}: ${c.length} cases, expected 1`)
    continue
  }
  const k = c[0]
  const f = fw.get(k.fw)
  if (!f) problems.push(`${s.id}: framework ${k.fw} does not exist`)
  if (k.choices.length < 2 || k.choices.length > 4) problems.push(`${s.id}: ${k.choices.length} choices; keep it to 2 to 4`)
  if (!k.choices.some((ch) => ch.grade === "strong")) problems.push(`${s.id}: no strong call`)
  const moves = k.choices.some((ch) => ch.set)
  if (moves !== !!k.moves) problems.push(`${s.id}: a case that moves the model needs a "moves" line, and only then`)
  k.choices.forEach((ch, i) => {
    if (f && (ch.row < 0 || ch.row >= f.rows.length)) problems.push(`${s.id} choice ${i + 1}: row ${ch.row} is outside ${k.fw} (${f.rows.length} rows)`)
    for (const key of [...Object.keys(ch.set ?? {}), ...Object.keys(ch.seed ?? {})]) {
      if (!(LAB_KEYS[s.lab] ?? []).includes(key)) problems.push(`${s.id} choice ${i + 1}: writes "${key}", which the ${s.lab} model does not read`)
    }
  })
}
for (const c of CASES) if (!course.sessions.some((s) => s.id === c.sheet)) problems.push(`case for ${c.sheet}: no such lesson`)

// Rewind conversations: every line lands on a real framework row, every turn has exactly one strong line, and every
// path through the conversation (one line per turn) reaches an ending. The best path must reach the best ending.
const talkProblems = problems.length
let paths = 0
for (const t of TALKS) {
  if (!course.sessions.some((s) => s.id === t.sheet)) problems.push(`talk ${t.id}: no lesson ${t.sheet}`)
  t.turns.forEach((turn, k) => {
    if (turn.lines.length < 2 || turn.lines.length > 3) problems.push(`talk ${t.id} turn ${k + 1}: ${turn.lines.length} lines; keep it to 2 or 3`)
    if (turn.lines.filter((l) => l.grade === "strong").length !== 1) problems.push(`talk ${t.id} turn ${k + 1}: needs exactly one strong line`)
    turn.lines.forEach((l, j) => {
      const f = fw.get(l.fw)
      if (!f) problems.push(`talk ${t.id} turn ${k + 1} line ${j + 1}: framework ${l.fw} does not exist`)
      else if (l.row < 0 || l.row >= f.rows.length) problems.push(`talk ${t.id} turn ${k + 1} line ${j + 1}: row ${l.row} is outside ${l.fw}`)
      if ((l.grade === "strong") !== (l.open === 1)) problems.push(`talk ${t.id} turn ${k + 1} line ${j + 1}: a strong line opens them up (+1), and only a strong one`)
      if (l.replyIf && !(l.replyIf.turn >= 0 && l.replyIf.turn < k)) problems.push(`talk ${t.id} turn ${k + 1} line ${j + 1}: replyIf must name an earlier turn`)
      if ((l.grade === "strong") === !!l.later) problems.push(`talk ${t.id} turn ${k + 1} line ${j + 1}: a line that is not strong says what it costs later ("later"), and a strong one does not`)
    })
  })
  const walk = (k: number, picks: number[]) => {
    if (k === t.turns.length) {
      paths++
      const { ending } = talkEnding(t, picks)
      if (!ending) problems.push(`talk ${t.id}: path ${picks.join(",")} has no ending`)
      return
    }
    t.turns[k].lines.forEach((_, j) => walk(k + 1, [...picks, j]))
  }
  walk(0, [])
  const best = t.turns.map((turn) => turn.lines.findIndex((l) => l.grade === "strong"))
  if (talkEnding(t, best).ending !== t.endings[0]) problems.push(`talk ${t.id}: the all-strong path does not reach the best ending`)
  // nobody in a conversation is given a gendered pronoun
  const text = JSON.stringify(t)
  const g = /\b(he|she|him|her|his|hers)\b/i.exec(text)
  if (g) problems.push(`talk ${t.id}: uses "${g[0]}"; write it without gendered pronouns`)
}
if (problems.length === talkProblems) console.log(`${TALKS.length} Rewind conversation${TALKS.length === 1 ? "" : "s"}, ${paths} paths, every one ending.`)

console.log(`${CASES.length} decision cases, ${CASES.reduce((a, c) => a + c.choices.length, 0)} choices, ${CASES.filter((c) => c.moves).length} that move their model.`)
if (problems.length) {
  console.log(problems.join("\n"))
  process.exit(1)
} else console.log("All clear: every lesson has one case, and every choice lands on its framework and model.")
