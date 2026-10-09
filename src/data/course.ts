import raw from "./course.json"
import { currentOf, todayStr, type ScheduleEntry } from "./schedule"

export type Check = { q: string; o: string[]; a: number; why: string }
export type Reading = {
  t: string
  a: string
  y: string
  src: string
  url?: string
  idea: string
  points: string[]
}
export type Session = {
  id: string
  n: number
  date: string
  part: string
  title: string
  idea: string
  readings: Reading[]
  videos: string[]
  caseName?: string
  caseBy?: string
  exercise?: string
  lab2?: string
  due: string[]
  lab: string
  fw: string[]
  checks: Check[]
  prompts: string[]
}
export type Framework = {
  id: string
  s: number
  name: string
  by: string
  one: string
  rows: [string, string][]
  head?: [string, string]
}
export type Resource = { t: string; u: string; w: string; k: string }

type Course = {
  course: { name: string }
  rules: string[]
  sessions: Session[]
  frameworks: Framework[]
  resources: Resource[]
}

export const C = raw as unknown as Course
export const SESSIONS = C.sessions
export const FRAMEWORKS = C.frameworks

export const sessionById = (id: string) => SESSIONS.find((s) => s.id === id)
export const fwById = (id: string) => FRAMEWORKS.find((f) => f.id === id)

export { fmt, fmtMono, todayStr, sheetNo, type ScheduleEntry } from "./schedule"

/** The next class on or after today, or the last one once the term is over. */
export const currentSession = (today = todayStr()) => currentOf(SESSIONS, today)

/** Each sheet's place in the schedule, for the client's progress store. */
export const SCHEDULE: ScheduleEntry[] = SESSIONS.map(({ id, n, date }) => ({ id, n, date }))

/** What the home page shows of a sheet: the grid card, Start here and This week. */
export type SheetSummary = Pick<Session, "id" | "n" | "date" | "part" | "title" | "idea" | "due"> & {
  readings: Pick<Reading, "t" | "a">[]
}
export const sheetSummaries = (): SheetSummary[] =>
  SESSIONS.map(({ id, n, date, part, title, idea, due, readings }) => ({
    id,
    n,
    date,
    part,
    title,
    idea,
    due,
    readings: readings.map(({ t, a }) => ({ t, a })),
  }))

/** Deterministic shuffle so server and client render the same option order. */
export function seededOrder(len: number, key: string) {
  const idx = Array.from({ length: len }, (_, i) => i)
  let seed = 0
  for (let k = 0; k < key.length; k++) seed = (seed * 31 + key.charCodeAt(k)) % 9973
  let st = seed + 0x6d2b79f5
  const rnd = () => {
    st = (st + 0x6d2b79f5) | 0
    let t = Math.imul(st ^ (st >>> 15), 1 | st)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  for (let z = idx.length - 1; z > 0; z--) {
    const r = Math.floor(rnd() * (z + 1))
    ;[idx[z], idx[r]] = [idx[r], idx[z]]
  }
  return idx
}

export const findCheck = (qid: string) => {
  const [sid, i] = qid.split("-")
  return sessionById(sid)?.checks[Number(i)]
}
