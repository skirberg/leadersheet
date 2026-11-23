"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, RotateCcw, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Emphasis } from "@/components/brand/emphasis"
import { Burst } from "./burst"
import { Num } from "@/components/motion/number"
import { localDay, useProgress } from "@/lib/store"
import { fwById, lessonPath, seededOrder, sessionById } from "@/data/course"
import { CULTURE_STYLES, TKI_MODES } from "@/data/labs"
import { BIAS_ITEMS, BIAS_NAMES, CONFLICT_QUIZ, CULTURE_QUIZ, LEAD_STYLES, LISTEN_QUIZ, LISTEN_STYLES, POWER_BASES, POWER_QUIZ, STYLE_QUIZ, VALUES, readValues, valuesGap } from "@/data/games"
import { cn } from "@/lib/utils"
import { BRAND } from "@/brand"
import { ShareResult } from "./share"
import { MirrorInvite } from "./mirror"
import { RESULT_GAMES, SPREAD, resultImage, resultPath, resultSlug, type ResultGame } from "@/data/results"
import { chancesIn, leadOf } from "@/lib/lead"
import { DecideChart } from "./decide-chart"
import type { Way } from "@/data/decide"

const shuffle = <T,>(a: T[]) => {
  const x = [...a]
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[x[i], x[j]] = [x[j], x[i]]
  }
  return x
}

/**
 * A game's card. `kind` is how long it takes ("Quiz · 6 situations") or where you are ("Team 2 of 4"); it is left out
 * once the screen says it already (a result, a survey under way, a conversation), never "Your result" over a result.
 */
export function GameShell({ kind, title, children }: { kind?: string; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl relative min-w-0 bg-card">
      <header className="flex items-baseline justify-between gap-4 border-b border-border px-5 py-4 sm:px-7">
        <h2 className="text-xl leading-tight sm:text-2xl">{title}</h2>
        {kind && <span className="label-mono shrink-0">{kind}</span>}
      </header>
      <div className="grid gap-6 p-5 sm:p-7">{children}</div>
    </section>
  )
}

/**
 * Where you are in a game: one tick per question, the done ones in ink and the current one outlined, with the count.
 * No "Question" label above it: the ticks say it (Wordle's rows, Duolingo's lesson bar).
 */
export function ProgressLine({ value, max, label }: { value: number; max: number; label?: string }) {
  return (
    <div className="flex items-center gap-3">
      <ol aria-hidden className="flex flex-1 gap-1">
        {Array.from({ length: max }, (_, k) => (
          <li
            key={k}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors duration-(--dur-ui)",
              k < value ? "bg-foreground" : k === value ? "bg-foreground/35" : "bg-border"
            )}
          />
        ))}
      </ol>
      <span className="font-mono text-xs text-muted-foreground tnum">
        {label && <span className="sr-only">{label} </span>}
        {Math.min(value + 1, max)} of {max}
      </span>
    </div>
  )
}

export function Choice({ children, onClick, k }: { children: React.ReactNode; onClick: () => void; k: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="choice group items-center press"
    >
      <span className="grid size-6 shrink-0 place-items-center rounded-[4px] border border-rule/70 font-mono text-xs text-muted-foreground group-hover:border-foreground group-hover:text-foreground">
        {k}
      </span>
      <span>{children}</span>
    </button>
  )
}

export const Disclaimer = ({ children }: { children: React.ReactNode }) => (
  <p className="border-t border-dashed border-border pt-4 text-xs text-muted-foreground">{children}</p>
)

/* Number keys 1 to n pick an option while a quiz or game is on screen. */
export function useNumberKeys(n: number, onPick: (i: number) => void, active: boolean) {
  const cb = React.useRef(onPick)
  cb.current = onPick
  React.useEffect(() => {
    if (!active) return
    const h = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target as HTMLElement
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return
      const k = Number(e.key)
      if (k >= 1 && k <= n) {
        e.preventDefault()
        cb.current(k - 1)
      }
    }
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  }, [n, active])
}

/* ─────────────── Culture quiz ─────────────── */

const MX = (v: number) => v * 240,
  MY = (v: number) => -v * 185

export function CultureGame() {
  const { lab, setLab } = useProgress()
  const [step, setStep] = React.useState(0)
  const [picks, setPicks] = React.useState<string[]>([])
  const [fire, setFire] = React.useState(0)
  const done = picks.length === CULTURE_QUIZ.length
  const Q = CULTURE_QUIZ[step]
  const order = React.useMemo(() => (Q ? seededOrder(Q.o.length, `culture-${step}`) : []), [Q, step])

  const pick = (i: number) => {
    if (done || !Q) return
    const next = [...picks, Q.o[order[i]][1]]
    setPicks(next)
    if (next.length === CULTURE_QUIZ.length) {
      setFire((f) => f + 1)
      setLab("g-culture", cultureResult(next).lead ?? SPREAD)
    } else setStep((s) => s + 1)
  }
  useNumberKeys(4, pick, !done)

  if (done) {
    const r = cultureResult(picks)
    const n = picks.length
    const share = r.lead ? `I fit a ${r.lead} culture. Which culture fits you?` : "No single culture fits me. Which culture fits you?"
    const key = r.lead ?? SPREAD
    return (
      <GameShell title="Which culture fits you?">
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center">
          <Burst fire={fire} />
          <div className="grid content-start gap-4">
            {r.lead && <p className="label-mono">You fit a</p>}
            <p className="font-serif text-5xl leading-none tracking-[-0.02em] sm:text-6xl">
              {r.lead ? (
                <>
                  <Emphasis>{r.lead}</Emphasis> culture
                </>
              ) : (
                <>
                  No <Emphasis>single</Emphasis> culture
                </>
              )}
            </p>
            <p className="text-lg text-pretty text-muted-foreground">{r.lead ? `${CULTURE_STYLES[r.lead][2]}.` : RESULT_GAMES.culture.desc(SPREAD)}</p>
            <div className="grid gap-2 border-t border-border pt-4">
              {r.ranked.map((k) => (
                <div key={k} className="grid grid-cols-[6.5rem_minmax(0,1fr)_1.5rem] items-center gap-3 text-sm">
                  <span className={cn(k === r.lead && "font-semibold", !r.tally[k] && "text-muted-foreground")}>{k}</span>
                  <div className="h-2 overflow-hidden rounded-full bg-border" role="img" aria-label={`${k}: ${r.tally[k]} of ${n}`}>
                    <div className={cn("h-full rounded-full", k === r.lead ? "bg-signal" : "bg-foreground")} style={{ width: `${(r.tally[k] / n) * 100}%` }} />
                  </div>
                  <span className="text-right font-mono text-xs tnum">{r.tally[k]}</span>
                </div>
              ))}
            </div>
            {(r.next.length > 0 || r.far) && (
              <dl className="grid gap-2 border-t border-border pt-4 text-base">
                {r.next.length > 0 && (
                  <div className="grid gap-x-2 sm:grid-cols-[9.5rem_minmax(0,1fr)]">
                    <dt className="font-semibold">Runner-up</dt>
                    <dd>{r.next.length === 1 ? `${r.next[0]}. ${CULTURE_STYLES[r.next[0]][2]}.` : `${andList(r.next)}.`}</dd>
                  </div>
                )}
                {r.far && (
                  <div className="grid gap-x-2 sm:grid-cols-[9.5rem_minmax(0,1fr)]">
                    <dt className="font-semibold">Expect friction with</dt>
                    <dd>{r.far}, the style farthest from your answers on the map.</dd>
                  </div>
                )}
              </dl>
            )}
            <div className="flex flex-wrap gap-2 pt-2">
              <ShareResult text={share} path={resultPath("culture", key)} image={resultImage("culture", key)} fileName={`${BRAND.id}-${key.toLowerCase()}-culture.png`} />
              <Button
                variant="ghost"
                onClick={() => {
                  setPicks([])
                  setStep(0)
                }}
              >
                <RotateCcw className="size-4" /> Retake
              </Button>
            </div>
          </div>
          <CultureMapResult you={r.pos} top={r.lead} tally={r.tally} />
        </div>
        <Disclaimer>
          For fun, not a validated assessment. Based on Groysberg et al. (2018).{" "}
          <Link href={lessonPath("s4")} className="font-semibold text-foreground underline-offset-4 hover:underline">
            Open lesson 4
          </Link>
        </Disclaimer>
      </GameShell>
    )
  }

  return (
    <GameShell kind="Quiz · 8 questions" title="Which culture fits you?">
      <ProgressLine value={step} max={CULTURE_QUIZ.length} label="Question" />
      <fieldset key={step} className="grid gap-3 animate-in fade-in slide-in-from-right-1 duration-(--dur-ui) ease-(--ease-draft)">
        <legend className="t-question mb-4 sm:text-3xl">{Q.q}</legend>
        {order.map((oi, i) => (
          <Choice key={oi} k={i + 1} onClick={() => pick(i)}>
            {Q.o[oi][0]}
          </Choice>
        ))}
      </fieldset>
      {lab<string | null>("g-culture", null) && step === 0 && (
        <p className="text-sm text-muted-foreground">
          {lab<string>("g-culture", "") === SPREAD ? "Last time, no clear lead." : `Last time you landed on ${lab<string>("g-culture", "")}.`}
        </p>
      )}
    </GameShell>
  )
}

export const andList = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`)

// The lead rule (more than half of a style's chances, and more than any other) lives in lib/lead.ts.
const cultureChances = chancesIn(CULTURE_QUIZ)
const conflictChances = chancesIn(CONFLICT_QUIZ)

export function cultureResult(picks: string[]) {
  const tally: Record<string, number> = Object.fromEntries(Object.keys(CULTURE_STYLES).map((k) => [k, 0]))
  picks.forEach((p) => (tally[p] += 1))
  const pos = picks.reduce((a, p) => [a[0] + CULTURE_STYLES[p][0] / picks.length, a[1] + CULTURE_STYLES[p][1] / picks.length], [0, 0])
  const dist = (k: string) => Math.hypot(CULTURE_STYLES[k][0] - pos[0], CULTURE_STYLES[k][1] - pos[1])
  const ranked = Object.keys(tally).sort((a, b) => tally[b] - tally[a] || dist(a) - dist(b))
  const second = ranked[1]
  const lead = leadOf(ranked, tally, cultureChances)
  // Runner-up: every style tied for second place, named only under a lead (in a spread they are the leaders).
  const next = lead && tally[second] > 0 ? ranked.filter((k) => k !== lead && tally[k] === tally[second]) : []
  // Friction: the style farthest from where your answers land, among the ones you never picked, so it can never also be the runner-up.
  const far = ranked.filter((k) => tally[k] === 0).sort((a, b) => dist(b) - dist(a))[0] as string | undefined
  return { lead, next, far, tally, ranked, pos }
}

export function CultureMapResult({ you, top, tally, className }: { you?: number[]; top?: string; tally?: Record<string, number>; className?: string }) {
  // With no style named and no answers to show (the shareable spread card), every style is marked: a little of each.
  const all = !top && !tally
  const r = (k: string) => (k === top ? (you ? 9 : 14) : tally ? (tally[k] ? 4 + 2 * tally[k] : 6) : all ? 9 : 6)
  const fill = (k: string) => (k === top ? (you ? "fill-ink" : "fill-signal") : (tally && tally[k]) || all ? "fill-ink" : "node")
  const label = you
    ? top
      ? `Culture map. Your answers land closest to ${top}.`
      : "Culture map. Your answers spread across it, with no clear lead."
    : top
      ? `Culture map with ${top} marked.`
      : "Culture map with every style marked. No clear lead."
  return (
    <svg className={cn("viz max-w-[560px]", className)} viewBox="-300 -232 600 470" role="img" aria-label={label}>
      <rect x={-260} y={-200} width={520} height={400} rx={4} className="grid-line" />
      <line className="grid-line" x1={0} y1={-200} x2={0} y2={200} />
      <line className="grid-line" x1={-260} y1={0} x2={260} y2={0} />
      <text x={0} y={-212} textAnchor="middle">Flexibility</text>
      <text x={0} y={222} textAnchor="middle">Stability</text>
      <text x={-250} y={-10}>Independence</text>
      <text x={250} y={-10} textAnchor="end">Interdependence</text>
      {Object.entries(CULTURE_STYLES).map(([k, p]) => (
        <g key={k}>
          <circle cx={MX(p[0])} cy={MY(p[1])} r={r(k)} className={fill(k)} />
          <text x={MX(p[0])} y={MY(p[1]) - 15} textAnchor="middle" className="lbl">
            {k}
          </text>
        </g>
      ))}
      {you && (
        <>
          {top && <line x1={MX(you[0])} y1={MY(you[1])} x2={MX(CULTURE_STYLES[top][0])} y2={MY(CULTURE_STYLES[top][1])} className="edge-signal" strokeDasharray="4 5" strokeWidth={2} />}
          <circle cx={MX(you[0])} cy={MY(you[1])} r={13} className="fill-signal" />
          <text x={MX(you[0])} y={MY(you[1]) + 4} textAnchor="middle" style={{ fill: "var(--signal-foreground)", fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 10 }}>
            You
          </text>
        </>
      )}
    </svg>
  )
}

/* ─────────────── Conflict quiz ─────────────── */

export function ConflictGame() {
  const { setLab } = useProgress()
  const [step, setStep] = React.useState(0)
  const [picks, setPicks] = React.useState<string[]>([])
  const [fire, setFire] = React.useState(0)
  const done = picks.length === CONFLICT_QUIZ.length
  const Q = CONFLICT_QUIZ[step]
  const order = React.useMemo(() => (Q ? seededOrder(Q.o.length, `conflict-${step}`) : []), [Q, step])

  const pick = (i: number) => {
    if (done || !Q) return
    const next = [...picks, Q.o[order[i]][1]]
    setPicks(next)
    if (next.length === CONFLICT_QUIZ.length) {
      setFire((f) => f + 1)
      setLab("g-conflict", conflictResult(next).lead ?? SPREAD)
    } else setStep((s) => s + 1)
  }
  useNumberKeys(5, pick, !done)

  if (done) {
    const { lead: top, tally, pos } = conflictResult(picks)
    const counts = Object.keys(TKI_MODES).map((m) => [m, tally[m]] as const)
    const key = top ?? SPREAD
    return (
      <GameShell title="How do you fight?">
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center">
          <Burst fire={fire} />
          <div className="grid content-start gap-4">
            {top && <p className="label-mono">Your go-to style</p>}
            <p className="font-serif text-5xl leading-none tracking-[-0.02em] sm:text-6xl">
              {top ? (
                <Emphasis>{top}</Emphasis>
              ) : (
                <>
                  No <Emphasis>go-to</Emphasis> style
                </>
              )}
            </p>
            <p className="text-lg text-pretty text-muted-foreground">{RESULT_GAMES.conflict.desc(key)}</p>
            <div className="grid gap-2 border-t border-border pt-4">
              {counts.map(([m, c]) => (
                <div key={m} className="grid grid-cols-[8.5rem_minmax(0,1fr)_2rem] items-center gap-3 text-sm">
                  <span className={cn(m === top && "font-semibold")}>{m}</span>
                  <div className="h-2 overflow-hidden rounded-full bg-border" role="img" aria-label={`${m}: ${c} of ${picks.length}`}>
                    <div className={cn("h-full rounded-full", m === top ? "bg-signal" : "bg-foreground")} style={{ width: `${(c / picks.length) * 100}%` }} />
                  </div>
                  <span className="text-right font-mono text-xs tnum">{c}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <ShareResult text={top ? `My go-to conflict style is ${top}. How do you fight?` : "I have no go-to conflict style. How do you fight?"} path={resultPath("conflict", key)} image={resultImage("conflict", key)} fileName={`${BRAND.id}-${key.toLowerCase()}.png`} />
              <Button
                variant="ghost"
                onClick={() => {
                  setPicks([])
                  setStep(0)
                }}
              >
                <RotateCcw className="size-4" /> Retake
              </Button>
            </div>
          </div>
          <ConflictChart top={top} you={pos} tally={tally} />
        </div>
        <Disclaimer>
          For fun, not a validated assessment or the Thomas-Kilmann instrument.{" "}
          <Link href={lessonPath("s7")} className="font-semibold text-foreground underline-offset-4 hover:underline">
            Open lesson 7
          </Link>
        </Disclaimer>
      </GameShell>
    )
  }

  return (
    <GameShell kind="Quiz · 6 situations" title="How do you fight?">
      <ProgressLine value={step} max={CONFLICT_QUIZ.length} label="Situation" />
      <fieldset key={step} className="grid gap-3 animate-in fade-in slide-in-from-right-1 duration-(--dur-ui) ease-(--ease-draft)">
        <legend className="t-question mb-4 sm:text-3xl">{Q.q}</legend>
        {order.map((oi, i) => (
          <Choice key={oi} k={i + 1} onClick={() => pick(i)}>
            {Q.o[oi][0]}
          </Choice>
        ))}
      </fieldset>
      <p className="text-xs text-muted-foreground">Go with your gut.</p>
    </GameShell>
  )
}

export function ConflictChart({ top, you, tally, className }: { top?: string; you?: number[]; tally?: Record<string, number>; className?: string }) {
  // As on the culture map: picked styles filled and sized by count, unpicked hollow; the shareable spread card marks every style.
  const all = !top && !tally
  const r = (k: string) => (k === top ? (you ? 9 : 14) : tally ? (tally[k] ? 4 + 2 * tally[k] : 7) : all ? 9 : 7)
  const fill = (k: string) => (k === top ? (you ? "fill-ink" : "fill-signal") : (tally && tally[k]) || all ? "fill-ink" : "node")
  const label = you
    ? top
      ? `Your answers on the assertiveness and cooperativeness chart, closest to ${top}`
      : "Your answers on the assertiveness and cooperativeness chart. No clear lead."
    : top
      ? `Assertiveness and cooperativeness chart with ${top} marked`
      : "Assertiveness and cooperativeness chart with every style marked. No clear lead."
  return (
    <svg className={cn("viz max-w-[560px]", className)} viewBox="0 0 600 344" role="img" aria-label={label}>
      <line className="grid-line" x1={60} y1={300} x2={580} y2={300} />
      <line className="grid-line" x1={60} y1={20} x2={60} y2={300} />
      <text x={320} y={330} textAnchor="middle">Cooperativeness →</text>
      <text x={22} y={160} textAnchor="middle" transform="rotate(-90 22 160)">Assertiveness →</text>
      {Object.entries(TKI_MODES).map(([k, p]) => (
        <g key={k}>
          <circle cx={60 + p[1] * 500} cy={300 - p[0] * 270} r={r(k)} className={fill(k)} />
          <text x={60 + p[1] * 500} y={300 - p[0] * 270 - Math.max(16, r(k) + 8)} textAnchor="middle" className="lbl">
            {k}
          </text>
        </g>
      ))}
      {you && (
        <>
          <circle cx={60 + you[1] * 500} cy={300 - you[0] * 270} r={13} className="fill-signal" />
          <text x={60 + you[1] * 500} y={300 - you[0] * 270 + 4} textAnchor="middle" style={{ fill: "var(--signal-foreground)", fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 10 }}>
            You
          </text>
        </>
      )}
    </svg>
  )
}

export function conflictResult(picks: string[]) {
  const tally: Record<string, number> = Object.fromEntries(Object.keys(TKI_MODES).map((k) => [k, 0]))
  picks.forEach((p) => (tally[p] += 1))
  const pos = picks.reduce((a, p) => [a[0] + TKI_MODES[p][0] / picks.length, a[1] + TKI_MODES[p][1] / picks.length], [0, 0])
  const ranked = Object.keys(tally).sort((a, b) => tally[b] - tally[a])
  return { lead: leadOf(ranked, tally, conflictChances), tally, pos }
}

/* ─────────────── Bias blitz ─────────────── */

const BLITZ_SECONDS = 60
const BLITZ_MISS_MS = 3000

export function BiasGame() {
  const { lab, setLab } = useProgress()
  const best = lab<number>("g-bias-best", 0)
  const [phase, setPhase] = React.useState<"idle" | "play" | "over">("idle")
  const [deck, setDeck] = React.useState<[string, string][]>([])
  const [i, setI] = React.useState(0)
  const [opts, setOpts] = React.useState<string[]>([])
  const [score, setScore] = React.useState(0)
  const [streak, setStreak] = React.useState(0)
  const [flash, setFlash] = React.useState<{ pick: string; ok: boolean } | null>(null)
  const [misses, setMisses] = React.useState<[pitch: string, bias: string, pick: string][]>([])
  const [tried, setTried] = React.useState(0)
  const [left, setLeft] = React.useState(BLITZ_SECONDS)
  const [fire, setFire] = React.useState(0)
  const [newBest, setNewBest] = React.useState(false)
  const end = React.useRef(0)
  const lock = React.useRef(false)

  const deal = React.useCallback((item: [string, string]) => {
    const wrong = shuffle(BIAS_NAMES.filter((b) => b !== item[1])).slice(0, 3)
    setOpts(shuffle([...wrong, item[1]]))
  }, [])

  const start = () => {
    const d = shuffle(BIAS_ITEMS)
    setDeck(d)
    setI(0)
    deal(d[0])
    setScore(0)
    setStreak(0)
    setTried(0)
    setMisses([])
    setFlash(null)
    lock.current = false
    end.current = Date.now() + BLITZ_SECONDS * 1000
    setLeft(BLITZ_SECONDS)
    setPhase("play")
  }

  React.useEffect(() => {
    if (phase !== "play") return
    const t = setInterval(() => {
      const s = Math.max(0, Math.ceil((end.current - Date.now()) / 1000))
      setLeft(s)
      if (s <= 0) setPhase("over")
    }, 200)
    return () => clearInterval(t)
  }, [phase])

  React.useEffect(() => {
    if (phase !== "over") return
    if (score > best) {
      setLab("g-bias-best", score)
      setNewBest(true)
      setFire((f) => f + 1)
    } else setNewBest(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const answer = (k: number) => {
    if (phase !== "play" || lock.current || !opts[k]) return
    const item = deck[i]
    const ok = opts[k] === item[1]
    lock.current = true
    setFlash({ pick: opts[k], ok })
    setTried((n) => n + 1)
    if (ok) {
      setScore((s) => s + 1)
      setStreak((s) => s + 1)
    } else {
      // a wrong answer costs three seconds, so reading the pitch beats tapping fast
      end.current -= BLITZ_MISS_MS
      setStreak(0)
      setMisses((m) => [...m, [item[0], item[1], opts[k]]])
    }
    setTimeout(
      () => {
        const n = (i + 1) % deck.length
        setI(n)
        deal(deck[n])
        setFlash(null)
        lock.current = false
      },
      ok ? 280 : 900
    )
  }
  useNumberKeys(4, answer, phase === "play")

  if (phase === "idle")
    return (
      <GameShell kind="60 seconds" title="Bias blitz">
        <p className="max-w-[56ch] text-lg">
          Name the trap in each pitch. A wrong answer costs three seconds.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="lg" onClick={start}>
            Start the clock <ArrowRight className="size-4" />
          </Button>
          {best > 0 && <span className="font-mono text-sm text-muted-foreground tnum">BEST {best}</span>}
        </div>
        <Disclaimer>All pitches are made up for practice.</Disclaimer>
      </GameShell>
    )

  if (phase === "over") {
    const uniq = misses.filter((m, k) => misses.findIndex((x) => x[0] === m[0]) === k)
    const k12 = fwById("k12")!.rows
    return (
      <GameShell title="Bias blitz">
        <div className="relative grid gap-2">
          <Burst fire={fire} />
          <p className="flex items-baseline gap-3">
            <span className="font-mono text-7xl leading-none font-medium tracking-tight tnum"><Num value={score} /></span>
            <span className="text-lg text-muted-foreground">spotted</span>
          </p>
          <p className="text-muted-foreground" role="status">
            {score} of {tried} right. {newBest ? "New best." : `Best so far: ${best}.`} {uniq.length ? `${uniq.length} to review below.` : "No misses."}
          </p>
        </div>
        {uniq.length > 0 && (
          <ul className="grid gap-4 border-t border-border pt-4" aria-label="Your misses">
            {uniq.map(([p, b, pick]) => (
              <li key={p} className="grid gap-1 text-base">
                <span>{p}</span>
                <span>
                  <span className="text-muted-foreground">You said {pick}. It is </span>
                  <b className="font-semibold">{b}</b>
                  <span className="text-muted-foreground">. The question that catches it: {k12.find((r) => r[0] === b)?.[1]}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap gap-2">
          <Button onClick={start} variant="outline">
            <RotateCcw className="size-4" /> Play again
          </Button>
          <ShareResult text={`I spotted ${score} biases in 60 seconds, ${score} of ${tried} right. Can you beat that?`} path="/play/bias/" />
          <Button asChild variant="outline">
            <Link href={lessonPath("s8")}>Open lesson 8</Link>
          </Button>
        </div>
      </GameShell>
    )
  }

  const item = deck[i]
  const k12 = fwById("k12")!.rows
  const hint = flash && !flash.ok ? k12.find((r) => r[0] === item[1])?.[1] : null
  return (
    <GameShell kind="60 seconds" title="Bias blitz">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-5">
          <span className="font-mono text-4xl font-medium tnum" aria-label={`${score} points`}>
            <Num value={score} />
          </span>
          {streak >= 3 && <span className="label-mono !text-signal-text">Streak {streak}</span>}
        </div>
        <span className={cn("font-mono text-2xl font-medium tnum", left <= 10 && "text-signal")} aria-hidden>
          <Num value={left % 60} prefix={`${Math.floor(left / 60)}:`} pad={2} />
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-border" aria-hidden>
        <div className="h-full origin-left bg-foreground transition-transform duration-200 ease-linear" style={{ transform: `scaleX(${left / BLITZ_SECONDS})` }} />
      </div>
      <p className="sr-only" aria-live="polite">
        {left % 15 === 0 && left > 0 ? `${left} seconds left. Score ${score}.` : ""}
      </p>
      <blockquote key={i} className="min-h-28 border-l-2 border-foreground pl-5 text-2xl leading-snug font-semibold tracking-[-0.01em] text-balance animate-in fade-in slide-in-from-right-2 duration-(--dur-ui) sm:text-3xl">
        {item[0]}
      </blockquote>
      <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label="Which trap?">
        {opts.map((o, k) => {
          const isAns = flash && o === item[1]
          const isWrong = flash && !flash.ok && o === flash.pick
          return (
            <button
              key={o}
              type="button"
              onClick={() => answer(k)}
              className={cn(
                "flex min-h-12 items-center gap-3 rounded-[14px] border border-border bg-card px-4 py-3 text-left text-base font-medium press",
                !flash && "hover:border-foreground/60",
                isAns && "border-ok bg-ok text-background",
                isWrong && "nudge text-muted-foreground line-through"
              )}
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-[4px] border border-current/30 font-mono text-xs">{k + 1}</span>
              {o}
              {isWrong && <X className="ml-auto size-4" />}
            </button>
          )
        })}
      </div>
      <p className="min-h-5 text-sm text-muted-foreground" role="status">
        {hint ? `${item[1]}: ${hint}` : ""}
      </p>
    </GameShell>
  )
}

/* ─────────────── Kotter climb ─────────────── */

export function ClimbGame() {
  const { lab, setLab } = useProgress()
  const best = lab<number>("g-climb-best", 0)
  const kotter = fwById("kotter-8")!.rows
  const steps = kotter.map((r) => r[0].replace(/^\d+ /, ""))
  const [tiles, setTiles] = React.useState<number[] | null>(null)
  const [next, setNext] = React.useState(0)
  const [bad, setBad] = React.useState<number | null>(null)
  const [t0, setT0] = React.useState(0)
  const [penalty, setPenalty] = React.useState(0)
  // each slip: the step that was due, and the one tapped instead
  const [slips, setSlips] = React.useState<[due: number, tapped: number][]>([])
  const [now, setNow] = React.useState(0)
  const [final, setFinal] = React.useState<number | null>(null)
  const [fire, setFire] = React.useState(0)
  const [newBest, setNewBest] = React.useState(false)

  const start = () => {
    setTiles(shuffle(steps.map((_, i) => i)))
    setNext(0)
    setBad(null)
    setPenalty(0)
    setSlips([])
    setFinal(null)
    const t = Date.now()
    setT0(t)
    setNow(t)
  }

  React.useEffect(() => {
    if (!tiles || final != null) return
    const h = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(h)
  }, [tiles, final])

  const tap = (step: number) => {
    if (final != null) return
    if (step === next) {
      const n = next + 1
      setNext(n)
      setBad(null)
      if (n === steps.length) {
        const total = Date.now() - t0 + penalty
        setFinal(total)
        if (!best || total < best) {
          setLab("g-climb-best", total)
          setNewBest(true)
          setFire((f) => f + 1)
        } else setNewBest(false)
      }
    } else {
      setBad(step)
      setPenalty((p) => p + 2000)
      setSlips((x) => (x.some(([d]) => d === next) ? x : [...x, [next, step]]))
      setTimeout(() => setBad((b) => (b === step ? null : b)), 260)
    }
  }

  const elapsed = final ?? (tiles ? now - t0 + penalty : 0)
  const secs = (ms: number) => (ms / 1000).toFixed(1)

  return (
    <GameShell kind="Speed run" title="Kotter climb">
      {!tiles ? (
        <>
          <p className="max-w-[56ch] text-lg">
            Tap Kotter’s eight steps of change in order. A wrong step costs two seconds.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Button size="lg" onClick={start}>
              Start climbing <ArrowRight className="size-4" />
            </Button>
            {best > 0 && <span className="font-mono text-sm text-muted-foreground tnum">BEST {secs(best)}s</span>}
          </div>
        </>
      ) : (
        <>
          <div className="relative flex items-end justify-between gap-4">
            <Burst fire={fire} />
            <svg className="viz !mx-0 min-w-0 max-w-[360px] flex-1" viewBox="0 0 600 220" role="img" aria-label={`${next} of 8 steps climbed`}>
              {steps.map((_, i) => {
                const x = 12 + i * 72,
                  y = 192 - i * 24
                return <rect key={i} x={x} y={y} width={66} height={212 - y} rx={3} className={i < next ? (i === next - 1 ? "fill-signal" : "fill-ink") : "fill-soft"} style={{ transition: "fill 200ms" }} />
              })}
              <line x1={4} x2={596} y1={212.5} y2={212.5} className="edge-ink" />
            </svg>
            <div className="shrink-0 text-right">
              <p className="font-mono text-3xl font-medium tnum sm:text-4xl">{secs(elapsed)}s</p>
              {penalty > 0 && <p className="font-mono text-xs text-muted-foreground tnum">+{penalty / 1000}s penalty</p>}
            </div>
          </div>
          <p className="sr-only" aria-live="polite">
            {final != null ? `Done in ${secs(final)} seconds.` : `${next} of 8 steps climbed.`}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="Steps, scrambled">
            {tiles.map((s) => {
              const placed = s < next
              return (
                <button
                  key={s}
                  type="button"
                  disabled={placed || final != null}
                  onClick={() => tap(s)}
                  className={cn(
                    "relative flex min-h-20 flex-col items-start justify-between gap-2 rounded-[14px] border border-border bg-card p-3 text-left text-base leading-snug font-semibold transition-[border-color,background-color,opacity]",
                    !placed && "hover:border-foreground/60",
                    placed && "border-foreground bg-foreground text-background",
                    bad === s && "nudge border-foreground"
                  )}
                >
                  <span className={cn("font-mono text-xs font-medium", placed ? "text-background/70" : "text-muted-foreground")}>{placed ? `Step ${s + 1}` : "?"}</span>
                  {steps[s]}
                </button>
              )
            })}
          </div>
          {final != null && (
            <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4" role="status">
              <p className="mr-2 text-base">
                <b className="font-semibold">{secs(final)} seconds.</b> {newBest ? "New best." : `Best: ${secs(best)}s.`}
              </p>
              <Button onClick={start} variant="outline">
                <RotateCcw className="size-4" /> Climb again
              </Button>
              <ShareResult text={`I climbed Kotter’s 8 steps of change in ${secs(final)} seconds. Can you beat that?`} path="/play/climb/" />
              <Button asChild variant="outline">
                <Link href={lessonPath("s5")}>Open lesson 5</Link>
              </Button>
            </div>
          )}
          {final != null && slips.length > 0 && (
            <div className="grid gap-3">
              <p className="font-semibold">Where you slipped</p>
              <ul className="grid gap-3">
                {slips.map(([due, tapped]) => (
                  <li key={due} className="grid gap-0.5 text-base">
                    <span>
                      <b className="font-semibold">Step {due + 1}, {steps[due]}</b>, comes before {steps[tapped]}.
                    </span>
                    {kotter[due]?.[1] && <span className="text-muted-foreground">Kotter’s matching error: {kotter[due][1].replace(/^Error: /, "")}.</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </GameShell>
  )
}

/* ─────────────── Style quizzes: leadership style, power, listening ─────────────── */

export type StyleQuizId = "style" | "power" | "listen"

const STYLE_QUIZZES: Record<StyleQuizId, { title: string; quiz: { q: string; o: [string, string][] }[]; styles: Record<string, string>; label: string; sheet: string; source: string }> = {
  style: { title: "Which leadership style is yours?", quiz: STYLE_QUIZ, styles: LEAD_STYLES, label: "Situation", sheet: "s14", source: "For fun, not a validated assessment. Based on Goleman (2000)." },
  power: { title: "Where does your power come from?", quiz: POWER_QUIZ, styles: POWER_BASES, label: "Situation", sheet: "s13", source: "For fun, not a validated assessment. Based on French and Raven (1959) and Raven (1965)." },
  listen: { title: "What kind of listener are you?", quiz: LISTEN_QUIZ, styles: LISTEN_STYLES, label: "Question", sheet: "s9", source: "For fun, not the Listening Styles Profile itself. Based on its four goals (Bodie, Worthington and Gearhart, 2013)." },
}

export function styleQuizResult(id: StyleQuizId, picks: string[]) {
  const { quiz, styles } = STYLE_QUIZZES[id]
  const tally: Record<string, number> = Object.fromEntries(Object.keys(styles).map((k) => [k, 0]))
  picks.forEach((p) => (tally[p] += 1))
  const ranked = Object.keys(tally).sort((a, b) => tally[b] - tally[a])
  return { lead: leadOf(ranked, tally, chancesIn(quiz)), tally }
}

export function StyleQuizGame({ id }: { id: StyleQuizId }) {
  const def = STYLE_QUIZZES[id]
  const { setLab } = useProgress()
  const [step, setStep] = React.useState(0)
  const [picks, setPicks] = React.useState<string[]>([])
  const [fire, setFire] = React.useState(0)
  const done = picks.length === def.quiz.length
  const Q = def.quiz[step]
  const n = Q?.o.length ?? 0
  const order = React.useMemo(() => (Q ? seededOrder(Q.o.length, `${id}-${step}`) : []), [Q, id, step])
  const pick = (i: number) => {
    if (done || !Q) return
    const next = [...picks, Q.o[order[i]][1]]
    setPicks(next)
    if (next.length === def.quiz.length) {
      setFire((f) => f + 1)
      setLab(`g-${id}`, styleQuizResult(id, next).lead ?? SPREAD)
    } else setStep((s) => s + 1)
  }
  useNumberKeys(n, pick, !done)

  if (done) {
    const { lead, tally } = styleQuizResult(id, picks)
    const g = RESULT_GAMES[id]
    const key = lead ?? SPREAD
    const [pre, word, post] = g.heading(key)
    return (
      <GameShell title={def.title}>
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
          <Burst fire={fire} />
          <div className="grid content-start gap-4">
            <p className="font-serif text-5xl leading-none tracking-[-0.02em] sm:text-6xl">
              {pre}
              <Emphasis>{word}</Emphasis>
              {post}
            </p>
            <p className="text-lg text-pretty text-muted-foreground">{g.desc(key)}</p>
            <div className="flex flex-wrap gap-2 pt-2">
              <ShareResult text={`${g.label(key)}. ${def.title}`} path={resultPath(id, key)} image={resultImage(id, key)} fileName={`${BRAND.id}-${id}-${resultSlug(key)}.png`} />
              <Button
                variant="ghost"
                onClick={() => {
                  setPicks([])
                  setStep(0)
                }}
              >
                <RotateCcw className="size-4" /> Retake
              </Button>
            </div>
          </div>
          <StyleBars id={id} top={lead} tally={tally} />
        </div>
        <Disclaimer>
          {def.source}{" "}
          <Link href={lessonPath(def.sheet)} className="font-semibold text-foreground underline-offset-4 hover:underline">
            Open lesson {sessionById(def.sheet)?.n}
          </Link>
        </Disclaimer>
      </GameShell>
    )
  }

  return (
    <GameShell kind={`Quiz · ${def.quiz.length} ${def.label === "Situation" ? "situations" : "questions"}`} title={def.title}>
      <ProgressLine value={step} max={def.quiz.length} label={def.label} />
      <fieldset key={step} className="grid gap-3 animate-in fade-in slide-in-from-right-1 duration-(--dur-ui) ease-(--ease-draft)">
        <legend className="t-question mb-4 sm:text-3xl">{Q.q}</legend>
        {order.map((oi, i) => (
          <Choice key={oi} k={i + 1} onClick={() => pick(i)}>
            {Q.o[oi][0]}
          </Choice>
        ))}
      </fieldset>
      <p className="text-xs text-muted-foreground">Go with your gut.</p>
    </GameShell>
  )
}

/* Every style as a bar. In the game the bars are your answers; on a result page or card the named style is the one bar drawn in pink, or every bar in ink for a spread. */
export function StyleBars({ id, top, tally, card, className }: { id: StyleQuizId; top?: string; tally?: Record<string, number>; card?: boolean; className?: string }) {
  const keys = Object.keys(STYLE_QUIZZES[id].styles)
  const n = STYLE_QUIZZES[id].quiz.length
  const v = (k: string) => (tally ? tally[k] / n : !top ? 0.5 : k === top ? 1 : 0.18)
  return (
    <div className={cn("grid w-full max-w-[560px] gap-3", card && "max-w-none gap-6", className)}>
      {keys.map((k) => (
        <div key={k} className={cn("grid grid-cols-[minmax(0,8.5rem)_minmax(0,1fr)_1.5rem] items-center gap-3 text-sm", card && "grid-cols-[13rem_minmax(0,1fr)] gap-5 text-[24px]")}>
          <span className={cn(k === top && "font-semibold", tally && !tally[k] && "text-muted-foreground")}>{k}</span>
          <div className={cn("h-2.5 overflow-hidden rounded-full bg-border", card && "h-4")} role="img" aria-label={tally ? `${k}: ${tally[k]} of ${n}` : k === top ? `${k}, your result` : k}>
            <div className={cn("h-full rounded-full", k === top ? "bg-signal" : "bg-foreground")} style={{ width: `${v(k) * 100}%` }} />
          </div>
          {!card && <span className="text-right font-mono text-xs tnum">{tally ? tally[k] : ""}</span>}
        </div>
      ))}
    </div>
  )
}

/* ─────────────── Values card sort ─────────────── */

/*
  Pick ten values, rank the five that matter most, then say how much of last week went to each. The point is the gap
  between what you rank first and where your week went. The result is kept in this browser (the progress store, key
  g-values), so it and the mirror link are still here after a reload, and Your sheet shows them. No share card: the
  mirror is how this one travels.
*/
const WEEK = ["None", "A little", "Some", "A lot"] as const

export function ValuesGame() {
  const { lab, setLab, ready } = useProgress()
  const [stage, setStage] = React.useState<"pick" | "rank" | "week" | "done">("pick")
  const [picked, setPicked] = React.useState<string[]>([])
  const [ranked, setRanked] = React.useState<string[]>([])
  const [week, setWeek] = React.useState<Record<string, number>>({})
  const [fire, setFire] = React.useState(0)
  // A saved sort comes back as the result until the visitor starts a new one.
  const [fresh, setFresh] = React.useState(false)
  const saved = ready && !fresh ? readValues(lab<unknown>("g-values", null)) : null
  React.useEffect(() => {
    if (!saved || stage !== "pick" || picked.length) return
    setPicked(saved.picked)
    setRanked(saved.ranked)
    setWeek(saved.week)
    setStage("done")
    // Once, when saved progress has loaded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])
  const reset = () => {
    setFresh(true)
    setStage("pick")
    setPicked([])
    setRanked([])
    setWeek({})
  }
  const chip = (on: boolean, n?: number) =>
    cn(
      "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm press",
      on ? "border-foreground bg-foreground text-background" : "border-border bg-background/40 hover:border-foreground/60",
      n !== undefined && "pl-1.5"
    )

  if (stage === "pick")
    return (
      <GameShell kind="Card sort · 3 steps" title="What do you value?">
        <ProgressLine value={0} max={3} />
        <p className="t-question sm:text-3xl">Pick the ten values that matter most to you.</p>
        <ul className="flex flex-wrap gap-2" aria-label="Values">
          {VALUES.map((v) => {
            const on = picked.includes(v)
            return (
              <li key={v}>
                <button
                  type="button"
                  aria-pressed={on}
                  disabled={!on && picked.length >= 10}
                  onClick={() => {
                    // Dropping a value also drops its rank, so the ranking stays a subset of the ten.
                    setPicked((p) => (on ? p.filter((x) => x !== v) : [...p, v]))
                    if (on) setRanked((r) => r.filter((x) => x !== v))
                  }}
                  className={cn(chip(on), "disabled:opacity-40")}
                >
                  {v}
                </button>
              </li>
            )
          })}
        </ul>
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-xs text-muted-foreground tnum">{picked.length} of 10</span>
          <Button disabled={picked.length < 10} onClick={() => setStage("rank")}>
            Next <ArrowRight className="size-4" />
          </Button>
        </div>
      </GameShell>
    )

  if (stage === "rank")
    return (
      <GameShell kind="Card sort · 3 steps" title="What do you value?">
        <ProgressLine value={1} max={3} />
        <p className="t-question sm:text-3xl">Tap your top five, most important first.</p>
        <ul className="flex flex-wrap gap-2" aria-label="Your ten values">
          {picked.map((v) => {
            const r = ranked.indexOf(v)
            const on = r >= 0
            return (
              <li key={v}>
                <button
                  type="button"
                  aria-pressed={on}
                  disabled={!on && ranked.length >= 5}
                  onClick={() => setRanked((p) => (on ? p.filter((x) => x !== v) : [...p, v]))}
                  className={cn(chip(on, r), "disabled:opacity-40")}
                >
                  <span className={cn("grid size-7 place-items-center rounded-full font-mono text-xs tnum", on ? "bg-signal text-signal-foreground" : "border border-rule/70 text-muted-foreground")}>
                    {on ? r + 1 : ""}
                  </span>
                  {v}
                </button>
              </li>
            )
          })}
        </ul>
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={() => setStage("pick")}>
            Back
          </Button>
          <Button disabled={ranked.length < 5} onClick={() => setStage("week")}>
            Next <ArrowRight className="size-4" />
          </Button>
        </div>
      </GameShell>
    )

  if (stage === "week")
    return (
      <GameShell kind="Card sort · 3 steps" title="What do you value?">
        <ProgressLine value={2} max={3} />
        <p className="t-question sm:text-3xl">How much of last week went to each?</p>
        <div className="grid gap-4">
          {ranked.map((v, i) => (
            <fieldset key={v} className="grid gap-2 sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)] sm:items-center">
              <legend className="contents">
                <span className="text-base font-semibold">
                  <span className="mr-2 font-mono text-xs text-muted-foreground tnum">{i + 1}</span>
                  {v}
                </span>
              </legend>
              <div className="grid grid-cols-4 gap-1.5">
                {WEEK.map((w, wi) => (
                  <button
                    key={w}
                    type="button"
                    aria-pressed={week[v] === wi}
                    onClick={() => setWeek((x) => ({ ...x, [v]: wi }))}
                    className={cn(
                      "min-h-11 rounded-md border px-2 text-sm press",
                      week[v] === wi ? "border-foreground bg-foreground text-background" : "border-border bg-background/40 hover:border-foreground/60"
                    )}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={() => setStage("rank")}>
            Back
          </Button>
          <Button
            disabled={ranked.some((v) => week[v] === undefined)}
            onClick={() => {
              setStage("done")
              setFire((f) => f + 1)
              setLab("g-values", { picked, ranked, week, at: localDay() })
            }}
          >
            See the gap <ArrowRight className="size-4" />
          </Button>
        </div>
      </GameShell>
    )

  const starved = valuesGap(ranked, week)
  const s = sessionById("s24")
  return (
    <GameShell title="What do you value?">
      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
        <Burst fire={fire} />
        <div className="grid content-start gap-4">
          <p className="font-serif text-5xl leading-none tracking-[-0.02em] sm:text-6xl">
            {starved.length ? (
              <>
                Your week <Emphasis>disagrees</Emphasis>
              </>
            ) : (
              <>
                Your week <Emphasis>agrees</Emphasis>
              </>
            )}
          </p>
          <p className="text-lg text-pretty text-muted-foreground">
            {starved.length > 1
              ? `${andList(starved)} are your top two and got little of last week.`
              : starved.length
                ? `${starved[0]} is your ${ranked.indexOf(starved[0]) === 0 ? "first" : "second"} value and got ${WEEK[week[starved[0]]].toLowerCase()} of last week.`
                : "Your top values got their share of last week."}
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="ghost" onClick={reset}>
              <RotateCcw className="size-4" /> Sort again
            </Button>
          </div>
        </div>
        <div className="grid w-full max-w-[560px] gap-3">
          {ranked.map((v, i) => (
            <div key={v} className="grid grid-cols-[1.25rem_minmax(0,8rem)_minmax(0,1fr)] items-center gap-3 text-sm">
              <span className="font-mono text-xs text-muted-foreground tnum">{i + 1}</span>
              <span className={cn(starved.includes(v) && "font-semibold")}>{v}</span>
              <div className="h-2.5 overflow-hidden rounded-full bg-border" role="img" aria-label={`${v}: ${WEEK[week[v]]}`}>
                <div className={cn("h-full rounded-full", starved.includes(v) ? "bg-signal" : "bg-foreground")} style={{ width: `${(week[v] / 3) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <MirrorInvite ranked={ranked} />
      <Disclaimer>
        Kept in this browser only. Based on Christensen (2010).{" "}
        {s && (
          <Link href={lessonPath(s.id)} className="font-semibold text-foreground underline-offset-4 hover:underline">
            Open lesson {s.n}
          </Link>
        )}
        {" · "}
        <Link href="/sheet/" className="font-semibold text-foreground underline-offset-4 hover:underline">
          Your sheet
        </Link>
      </Disclaimer>
    </GameShell>
  )
}

/* The model drawn beside a result on its page and its card. */
export function ResultVisual({ game, top, card }: { game: ResultGame; top?: string; card?: boolean }) {
  if (game === "culture") return <CultureMapResult top={top} className={card ? "max-w-none" : undefined} />
  if (game === "conflict") return <ConflictChart top={top} className={card ? "max-w-none" : undefined} />
  if (game === "decide") return <DecideChart top={top as Way | undefined} card={card} />
  return <StyleBars id={game} top={top} card={card} />
}
