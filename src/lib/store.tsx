"use client"

import { track } from "@vercel/analytics"
import * as React from "react"
import { currentOf, todayStr, type ScheduleEntry } from "@/data/schedule"

/* Progress lives in this browser only. Nothing is sent anywhere. */
const KEY = "lio-sandbox"

export type Mode = "study" | "play"

type State = {
  mode: Mode
  /** Class mode adds the schedule: this week, dates and what is due. Off for the public. */
  classMode: boolean
  best: Record<string, number>
  miss: string[]
  due: Record<string, boolean>
  seen: Record<string, 1>
  lab: Record<string, unknown>
}
const EMPTY: State = { mode: "study", classMode: false, best: {}, miss: [], due: {}, seen: {}, lab: {} }

type Ctx = {
  ready: boolean
  state: State
  /** This week's sheet (the next class), from the browser's date once ready. */
  current: ScheduleEntry
  mode: Mode
  setMode: (m: Mode) => void
  classMode: boolean
  setClassMode: (on: boolean) => void
  setBest: (sid: string, n: number) => void
  markMiss: (qid: string, ok: boolean) => void
  setDue: (k: string, v: boolean) => void
  markSeen: (sid: string) => void
  lab: <T>(k: string, fallback: T) => T
  setLab: (k: string, v: unknown) => void
  reset: () => void
}

const ProgressContext = React.createContext<Ctx | null>(null)

function load(): State {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "{}")
    if (!v || typeof v !== "object") return EMPTY
    return {
      mode: v.mode === "play" ? "play" : "study",
      classMode: v.classMode === true,
      best: v.best ?? {},
      miss: Array.isArray(v.miss) ? v.miss : [],
      due: v.due ?? {},
      seen: v.seen ?? {},
      lab: v.lab ?? {},
    }
  } catch {
    return EMPTY
  }
}

export function ProgressProvider({
  children,
  schedule,
  buildCurrent,
}: {
  children: React.ReactNode
  /** Every sheet's id, number and date, passed from the server so the course itself stays off the client. */
  schedule: ScheduleEntry[]
  buildCurrent: ScheduleEntry
}) {
  const [state, setState] = React.useState<State>(EMPTY)
  const [ready, setReady] = React.useState(false)
  // The build date seeds the first render; the real date takes over after mount.
  const [current, setCurrent] = React.useState<ScheduleEntry>(buildCurrent)

  React.useEffect(() => {
    const s = load()
    // A shared link with ?class turns class mode on (and ?class=off turns it off); it is remembered.
    const q = new URLSearchParams(window.location.search).get("class")
    if (q !== null) s.classMode = q !== "off" && q !== "0"
    setState(s)
    setCurrent(currentOf(schedule, todayStr()))
    setReady(true)
  }, []) // once, on load: the schedule never changes

  React.useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {}
  }, [state, ready])

  const value = React.useMemo<Ctx>(
    () => ({
      ready,
      state,
      current,
      mode: state.mode,
      setMode: (m) => {
        setState((s) => ({ ...s, mode: m }))
        track("Mode switched", { mode: m })
      },
      classMode: ready && state.classMode,
      setClassMode: (on) => {
        setState((s) => ({ ...s, classMode: on }))
        track("Class mode", { on: on ? "on" : "off" })
      },
      setBest: (sid, n) =>
        setState((s) => ({ ...s, best: { ...s.best, [sid]: Math.max(s.best[sid] ?? 0, n) } })),
      markMiss: (qid, ok) =>
        setState((s) => {
          const has = s.miss.includes(qid)
          if (ok && has) return { ...s, miss: s.miss.filter((x) => x !== qid) }
          if (!ok && !has) return { ...s, miss: [...s.miss, qid] }
          return s
        }),
      setDue: (k, v) => setState((s) => ({ ...s, due: { ...s.due, [k]: v } })),
      markSeen: (sid) =>
        setState((s) => (s.seen[sid] ? s : { ...s, seen: { ...s.seen, [sid]: 1 } })),
      lab: <T,>(k: string, fallback: T) => (k in state.lab ? (state.lab[k] as T) : fallback),
      setLab: (k, v) => setState((s) => ({ ...s, lab: { ...s.lab, [k]: v } })),
      reset: () => setState((s) => ({ ...EMPTY, mode: s.mode, classMode: s.classMode })),
    }),
    [ready, state, current]
  )

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress() {
  const c = React.useContext(ProgressContext)
  if (!c) throw new Error("useProgress needs ProgressProvider")
  return c
}

export function useReducedMotion() {
  const [rm, setRm] = React.useState(false)
  React.useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)")
    setRm(m.matches)
    const on = () => setRm(m.matches)
    m.addEventListener("change", on)
    return () => m.removeEventListener("change", on)
  }, [])
  return rm
}
