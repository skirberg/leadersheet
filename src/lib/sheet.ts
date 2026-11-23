/*
  Your sheet: what the site already keeps in this browser, gathered onto one page. Lessons passed, the call you made in
  each lesson and how it graded, your quiz and test results, your five values and what the mirror said, and your best
  scores. Nothing new is stored to make it; nothing leaves the browser unless you send it.

  A shared sheet travels in the link after # (browsers never send that part to a server), the way the values mirror
  does: `/sheet/#sheet=1&...`. The link carries no names of the people who answered your mirror, only how many did and
  the values they saw most.
*/
import { SESSIONS } from "@/data/course"
import { CASES, type Grade } from "@/data/cases"
import { MIRROR_ABC, VALUES, mostSeen, readMirrorAnswers, readValues, valuesGap, type MirrorAnswer } from "@/data/games"
import { RESULT_GAMES, type ResultGame } from "@/data/results"
import { ROUNDS } from "@/lib/team-math"
import { callIndex } from "@/data/daily"

/** The result games in the order the sheet lists them. */
export const SHEET_GAMES: ResultGame[] = ["decide", "style", "conflict", "power", "listen", "culture"]

export type SheetData = {
  /** Lesson ids passed (three of three), in course order. */
  passed: string[]
  /** Lessons opened at least once. */
  opened: number
  /** The call made in each lesson, in course order: the lesson id and the index of the choice. */
  calls: { sheet: string; choice: number }[]
  /** Result key per game (a style or the spread). */
  styles: Partial<Record<ResultGame, string>>
  /** Your five, in order, and whether last week agreed with them. */
  values: { five: string[]; agrees: boolean } | null
  /** The mirror, without names: how many people answered and the values they saw in you most. */
  seen: { people: number; top: string[] } | null
  games: { bias?: number; climb?: number; team?: number }
  /** Today's call (/today/): how many days' calls were made, and how many of them were strong calls. */
  daily: { made: number; strong: number }
  streak: number
}

/** The part of the progress store the sheet reads (see lib/store.tsx). */
export type Stored = { best: Record<string, number>; seen: Record<string, unknown>; lab: Record<string, unknown> }

const choiceOf = (lab: Record<string, unknown>, sheet: string) => {
  const c = CASES.find((x) => x.sheet === sheet)
  const v = lab[`case-${sheet}`]
  return c && Number.isInteger(v) && (v as number) >= 0 && (v as number) < c.choices.length ? (v as number) : undefined
}
const num = (v: unknown, max: number) => (typeof v === "number" && Number.isFinite(v) && v > 0 && v <= max ? v : undefined)

export function sheetFrom(s: Stored, streak = 0): SheetData {
  const styles: SheetData["styles"] = {}
  for (const g of SHEET_GAMES) {
    const k = s.lab[`g-${g}`]
    if (typeof k === "string" && RESULT_GAMES[g].keys.includes(k)) styles[g] = k
  }
  const v = readValues(s.lab["g-values"])
  const answers = readMirrorAnswers(s.lab["g-mirror"])
  const team = s.lab["g-team-best"]
  return {
    passed: SESSIONS.filter((x) => (s.best[x.id] ?? 0) >= 3).map((x) => x.id),
    opened: SESSIONS.filter((x) => x.id in s.seen).length,
    calls: SESSIONS.flatMap((x) => {
      const choice = choiceOf(s.lab, x.id)
      return choice === undefined ? [] : [{ sheet: x.id, choice }]
    }),
    styles,
    values: v ? { five: v.ranked, agrees: valuesGap(v.ranked, v.week).length === 0 } : null,
    seen: answers.length ? { people: answers.length, top: mostSeen(answers, v?.ranked).slice(0, 3).map((x) => x.value) } : null,
    games: {
      bias: num(s.lab["g-bias-best"], 999),
      climb: num(s.lab["g-climb-best"], 3_600_000),
      team: Number.isInteger(team) && (team as number) >= 0 && (team as number) <= ROUNDS.length ? (team as number) : undefined,
    },
    daily: dailyOf(s.lab.daily),
    streak: Math.max(0, Math.floor(streak)),
  }
}

/** Today's call log (lab.daily: call number to the choice made) as a count, graded the way /today/ grades it. */
function dailyOf(log: unknown) {
  let made = 0,
    strong = 0
  if (log && typeof log === "object")
    for (const [k, v] of Object.entries(log as Record<string, { i?: unknown }>)) {
      const n = Number(k)
      const choice = CASES[callIndex(n, CASES.length)]?.choices[v?.i as number]
      if (!Number.isInteger(n) || n < 1 || !choice) continue
      made++
      if (choice.grade === "strong") strong++
    }
  return { made, strong }
}

export const gradeOf = (c: { sheet: string; choice: number }): Grade | undefined => CASES.find((x) => x.sheet === c.sheet)?.choices[c.choice]?.grade

export function gradeCount(calls: SheetData["calls"]) {
  const n: Record<Grade, number> = { strong: 0, tradeoff: 0, costly: 0 }
  for (const c of calls) {
    const g = gradeOf(c)
    if (g) n[g] += 1
  }
  return n
}

/** True when nothing is on the sheet yet. */
export const isEmpty = (d: SheetData) =>
  !d.passed.length && !d.opened && !d.calls.length && !d.daily.made && !Object.keys(d.styles).length && !d.values && !d.seen && d.games.bias === undefined && d.games.climb === undefined && d.games.team === undefined

/* ─────────────── The link ─────────────── */

const ORDER = () => SESSIONS.map((x) => x.id)
const abc = (vs: string[]) => vs.map((v) => MIRROR_ABC[VALUES.indexOf(v)]).join("")
const unabc = (s: string) => [...s].map((c) => VALUES[MIRROR_ABC.indexOf(c)]).filter((v): v is string => !!v)

export function encodeSheet(d: SheetData, name = "") {
  const ids = ORDER()
  const p = new URLSearchParams()
  p.set("sheet", "1")
  let bits = 0n
  ids.forEach((id, i) => d.passed.includes(id) && (bits |= 1n << BigInt(i)))
  if (bits) p.set("p", bits.toString(36))
  if (d.opened) p.set("o", String(d.opened))
  if (d.calls.length) p.set("c", ids.map((id) => d.calls.find((c) => c.sheet === id)?.choice ?? "-").join("").replace(/-+$/, ""))
  const q = SHEET_GAMES.map((g) => {
    const i = d.styles[g] ? RESULT_GAMES[g].keys.indexOf(d.styles[g]!) : -1
    return i >= 0 ? i.toString(36) : "-"
  }).join("")
  if (/[^-]/.test(q)) p.set("q", q.replace(/-+$/, ""))
  if (d.values) {
    p.set("v", abc(d.values.five))
    p.set("w", d.values.agrees ? "1" : "0")
  }
  if (d.seen) p.set("m", `${d.seen.people}.${abc(d.seen.top)}`)
  if (d.games.bias !== undefined) p.set("b", String(d.games.bias))
  if (d.games.climb !== undefined) p.set("k", String(Math.round(d.games.climb / 100)))
  if (d.games.team !== undefined) p.set("t", String(d.games.team))
  if (d.daily.made) p.set("y", `${d.daily.made}.${d.daily.strong}`)
  if (d.streak) p.set("d", String(d.streak))
  const n = name.trim().slice(0, 24)
  if (n) p.set("n", n)
  return `#${p.toString()}`
}

/** A shared sheet from a link, or null when the link carries none. Fields that do not check out are left off. */
export function decodeSheet(hash: string): { data: SheetData; name: string } | null {
  const p = new URLSearchParams(hash.replace(/^#/, ""))
  if (p.get("sheet") !== "1") return null
  const ids = ORDER()
  const int = (k: string, max: number) => {
    const v = Number(p.get(k))
    return p.has(k) && Number.isInteger(v) && v >= 0 && v <= max ? v : undefined
  }
  let bits = 0n
  try {
    const raw = p.get("p") ?? ""
    if (/^[0-9a-z]{1,8}$/.test(raw)) bits = [...raw].reduce((a, c) => a * 36n + BigInt(parseInt(c, 36)), 0n)
  } catch {}
  const passed = ids.filter((_, i) => (bits >> BigInt(i)) & 1n)
  const calls = [...(p.get("c") ?? "").slice(0, ids.length)].flatMap((ch, i) => {
    const c = CASES.find((x) => x.sheet === ids[i])
    const k = Number(ch)
    return c && ch !== "-" && Number.isInteger(k) && k < c.choices.length ? [{ sheet: ids[i], choice: k }] : []
  })
  const styles: SheetData["styles"] = {}
  ;[...(p.get("q") ?? "").slice(0, SHEET_GAMES.length)].forEach((ch, i) => {
    const g = SHEET_GAMES[i]
    const k = RESULT_GAMES[g].keys[parseInt(ch, 36)]
    if (ch !== "-" && k) styles[g] = k
  })
  const five = unabc(p.get("v") ?? "")
  const m = /^(\d{1,2})\.([a-z2-7]{0,3})$/.exec(p.get("m") ?? "")
  const climb = int("k", 36000)
  const y = /^(\d{1,4})\.(\d{1,4})$/.exec(p.get("y") ?? "")
  const data: SheetData = {
    passed,
    opened: Math.max(int("o", ids.length) ?? 0, passed.length),
    calls,
    styles,
    values: five.length === 5 && new Set(five).size === 5 ? { five, agrees: p.get("w") !== "0" } : null,
    seen: m && Number(m[1]) > 0 ? { people: Number(m[1]), top: unabc(m[2]) } : null,
    games: { bias: int("b", 999) || undefined, climb: climb ? climb * 100 : undefined, team: int("t", ROUNDS.length) },
    daily: y && Number(y[2]) <= Number(y[1]) ? { made: Number(y[1]), strong: Number(y[2]) } : { made: 0, strong: 0 },
    streak: int("d", 100000) ?? 0,
  }
  return { data, name: (p.get("n") ?? "").trim().slice(0, 24) }
}

/** The words that go with a shared sheet. */
export function sheetShareText(d: SheetData) {
  const parts: string[] = []
  if (d.passed.length) parts.push(`${d.passed.length} of ${SESSIONS.length} lessons passed`)
  if (d.calls.length) {
    const g = gradeCount(d.calls)
    parts.push(`${g.strong} strong ${g.strong === 1 ? "call" : "calls"} in ${d.calls.length}`)
  }
  if (d.styles.decide) parts.push(`I decide: ${RESULT_GAMES.decide.label(d.styles.decide)}`)
  if (d.values) parts.push(`${d.values.five[0]} first`)
  return parts.length ? `My sheet on Leadersheet: ${parts.slice(0, 3).join(", ")}.` : "Leadersheet: learn leadership by doing."
}

/** A mirror answer for the owner's own sheet, newest first. */
export const mirrorAnswersOf = (s: Stored): MirrorAnswer[] => readMirrorAnswers(s.lab["g-mirror"])
