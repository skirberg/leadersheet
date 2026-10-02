"use client"

import * as React from "react"
import { currentSession, todayStr, type Session } from "@/data/course"

/* Progress lives in this browser only. Nothing is sent anywhere. */
const KEY = "lio-sandbox"

type State = {
  best: Record<string, number>
  miss: string[]
  due: Record<string, boolean>
  seen: Record<string, 1>
  lab: Record<string, unknown>
}
const EMPTY: State = { best: {}, miss: [], due: {}, seen: {}, lab: {} }

type Ctx = {
  ready: boolean
  state: State
  current: Session
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
  buildCurrent,
}: {
  children: React.ReactNode
  buildCurrent: Session
}) {
  const [state, setState] = React.useState<State>(EMPTY)
  const [ready, setReady] = React.useState(false)
  // The build date seeds the first render; the real date takes over after mount.
  const [current, setCurrent] = React.useState<Session>(buildCurrent)

  React.useEffect(() => {
    setState(load())
    setCurrent(currentSession(todayStr()))
    setReady(true)
  }, [])

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
      reset: () => setState(EMPTY),
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
