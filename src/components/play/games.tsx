"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, Check as CheckIcon, Copy, RotateCcw, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Burst } from "./burst"
import { Num } from "@/components/motion/number"
import { useProgress } from "@/lib/store"
import { fwById, seededOrder } from "@/data/course"
import { CULTURE_STYLES, TKI_MODES } from "@/data/labs"
import { BIAS_ITEMS, BIAS_NAMES, CONFLICT_QUIZ, CULTURE_QUIZ } from "@/data/games"
import { cn } from "@/lib/utils"
import { BRAND } from "@/brand"

const shuffle = <T,>(a: T[]) => {
  const x = [...a]
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[x[i], x[j]] = [x[j], x[i]]
  }
  return x
}

export function GameShell({ kind, title, children }: { kind: string; title: string; children: React.ReactNode }) {
  return (
    <section className="corners relative min-w-0 border border-border bg-card">
      <header className="flex items-baseline justify-between gap-4 border-b border-border px-5 py-4 sm:px-7">
        <h2 className="text-xl leading-tight font-semibold tracking-[-0.01em] sm:text-2xl">{title}</h2>
        <span className="label-mono shrink-0">{kind}</span>
      </header>
      <div className="grid gap-6 p-5 sm:p-7">{children}</div>
    </section>
  )
}

function ProgressLine({ value, max, label }: { value: number; max: number; label: string }) {
  return (
    <div className="grid gap-2">
      <div className="flex justify-between font-mono text-xs text-muted-foreground tnum">
        <span>{label}</span>
        <span>
          {String(Math.min(value + 1, max)).padStart(2, "0")} / {String(max).padStart(2, "0")}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-border">
        <div className="h-full bg-foreground transition-[width] duration-300 ease-(--ease-draft)" style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  )
}

function Choice({ children, onClick, k }: { children: React.ReactNode; onClick: () => void; k: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-12 w-full items-center gap-3 rounded-md border border-border bg-background/40 px-4 py-3 text-left text-[15px] transition-[border-color,background-color,transform] duration-(--dur-ui) hover:border-foreground/60 hover:bg-background active:scale-[0.99]"
    >
      <span className="grid size-6 shrink-0 place-items-center rounded-[4px] border border-rule/70 font-mono text-[11px] text-muted-foreground group-hover:border-foreground group-hover:text-foreground">
        {k}
      </span>
      <span>{children}</span>
    </button>
  )
}

function CopyResult({ text }: { text: string }) {
  const [done, setDone] = React.useState(false)
  return (
    <Button
      variant="outline"
      onClick={() => {
        const line = `${text} ${window.location.href}`
        navigator.clipboard?.writeText(line).then(
          () => setDone(true),
          () => setDone(false)
        )
      }}
    >
      {done ? <CheckIcon className="size-4" /> : <Copy className="size-4" />} {done ? "Copied" : "Copy my result"}
    </Button>
  )
}

const Disclaimer = ({ children }: { children: React.ReactNode }) => (
  <p className="border-t border-dashed border-border pt-4 text-xs text-muted-foreground">{children}</p>
)

/* Number keys 1 to n pick an option while a quiz or game is on screen. */
function useNumberKeys(n: number, onPick: (i: number) => void, active: boolean) {
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
      setLab("g-culture", resultOf(next).top)
    } else setStep((s) => s + 1)
  }
  useNumberKeys(4, pick, !done)

  if (done) {
    const r = resultOf(picks)
    const [ox, oy, desc] = CULTURE_STYLES[r.top]
    const far = Object.entries(CULTURE_STYLES).sort(
      (a, b) => Math.hypot(b[1][0] - ox, b[1][1] - oy) - Math.hypot(a[1][0] - ox, a[1][1] - oy)
    )[0][0]
    return (
      <GameShell kind="Your result" title="Which culture fits you?">
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center">
          <Burst fire={fire} />
          <div className="grid content-start gap-4">
            <p className="label-mono">You fit a</p>
            <p className="text-5xl leading-none font-semibold tracking-[-0.03em] sm:text-6xl">{r.top} culture</p>
            <p className="text-lg text-muted-foreground">{desc}.</p>
            <dl className="grid gap-2 border-t border-border pt-4 text-[15px]">
              {r.second && (
                <div className="grid gap-x-2 sm:grid-cols-[9.5rem_minmax(0,1fr)]">
                  <dt className="font-semibold">Runner-up</dt>
                  <dd>
                    {r.second}. {CULTURE_STYLES[r.second][2]}.
                  </dd>
                </div>
              )}
              <div className="grid gap-x-2 sm:grid-cols-[9.5rem_minmax(0,1fr)]">
                <dt className="font-semibold">Expect friction with</dt>
                <dd>{far}, the style farthest from yours on the map.</dd>
              </div>
            </dl>
            <div className="flex flex-wrap gap-2 pt-2">
              <CopyResult text={`I fit a ${r.top} culture on the ${BRAND.name} culture map.`} />
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
          <CultureMapResult you={r.pos} top={r.top} />
        </div>
        <Disclaimer>
          For fun, not a validated assessment. Based on Groysberg et al. (2018).{" "}
          <Link href="/learn/s4/" className="font-semibold text-foreground underline-offset-4 hover:underline">
            Open sheet S04
          </Link>
        </Disclaimer>
      </GameShell>
    )
  }

  return (
    <GameShell kind="Quiz · 8 questions" title="Which culture fits you?">
      <ProgressLine value={step} max={CULTURE_QUIZ.length} label="QUESTION" />
      <fieldset key={step} className="grid gap-3 animate-in fade-in slide-in-from-right-2 duration-300">
        <legend className="mb-4 text-2xl leading-snug font-semibold tracking-[-0.01em] text-balance">{Q.q}</legend>
        {order.map((oi, i) => (
          <Choice key={oi} k={i + 1} onClick={() => pick(i)}>
            {Q.o[oi][0]}
          </Choice>
        ))}
      </fieldset>
      {lab<string | null>("g-culture", null) && step === 0 && (
        <p className="text-sm text-muted-foreground">Last time you landed on {lab<string>("g-culture", "")}.</p>
      )}
    </GameShell>
  )
}

function resultOf(picks: string[]) {
  const tally: Record<string, number> = {}
  picks.forEach((p) => (tally[p] = (tally[p] ?? 0) + 1))
  const pos = picks.reduce((a, p) => [a[0] + CULTURE_STYLES[p][0] / picks.length, a[1] + CULTURE_STYLES[p][1] / picks.length], [0, 0])
  const dist = (k: string) => Math.hypot(CULTURE_STYLES[k][0] - pos[0], CULTURE_STYLES[k][1] - pos[1])
  const ranked = Object.keys(tally).sort((a, b) => tally[b] - tally[a] || dist(a) - dist(b))
  return { top: ranked[0], second: ranked[1] as string | undefined, pos }
}

function CultureMapResult({ you, top }: { you: number[]; top: string }) {
  return (
    <svg className="viz max-w-[560px]" viewBox="-300 -232 600 470" role="img" aria-label={`Culture map. Your answers land closest to ${top}.`}>
      <rect x={-260} y={-200} width={520} height={400} rx={4} className="grid-line" />
      <line className="grid-line" x1={0} y1={-200} x2={0} y2={200} />
      <line className="grid-line" x1={-260} y1={0} x2={260} y2={0} />
      <text x={0} y={-212} textAnchor="middle">FLEXIBILITY</text>
      <text x={0} y={222} textAnchor="middle">STABILITY</text>
      <text x={-250} y={-10}>INDEPENDENCE</text>
      <text x={250} y={-10} textAnchor="end">INTERDEPENDENCE</text>
      {Object.entries(CULTURE_STYLES).map(([k, p]) => (
        <g key={k}>
          <circle cx={MX(p[0])} cy={MY(p[1])} r={k === top ? 9 : 6} className={k === top ? "fill-ink" : "node"} />
          <text x={MX(p[0])} y={MY(p[1]) - 15} textAnchor="middle" className="lbl">
            {k}
          </text>
        </g>
      ))}
      <line x1={MX(you[0])} y1={MY(you[1])} x2={MX(CULTURE_STYLES[top][0])} y2={MY(CULTURE_STYLES[top][1])} className="edge-signal" strokeDasharray="4 5" strokeWidth={2} />
      <circle cx={MX(you[0])} cy={MY(you[1])} r={13} className="fill-signal" />
      <text x={MX(you[0])} y={MY(you[1]) + 4} textAnchor="middle" style={{ fill: "var(--signal-foreground)", fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 10 }}>
        YOU
      </text>
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
      setLab("g-conflict", topMode(next))
    } else setStep((s) => s + 1)
  }
  useNumberKeys(5, pick, !done)

  if (done) {
    const top = topMode(picks)
    const counts = Object.keys(TKI_MODES).map((m) => [m, picks.filter((p) => p === m).length] as const)
    const pos = picks.reduce((a, p) => [a[0] + TKI_MODES[p][0] / picks.length, a[1] + TKI_MODES[p][1] / picks.length], [0, 0])
    return (
      <GameShell kind="Your result" title="How do you fight?">
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center">
          <Burst fire={fire} />
          <div className="grid content-start gap-4">
            <p className="label-mono">Your go-to style</p>
            <p className="text-5xl leading-none font-semibold tracking-[-0.03em] sm:text-6xl">{top}</p>
            <p className="text-lg text-muted-foreground">{TKI_MODES[top][2]}</p>
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
              <CopyResult text={`My go-to conflict style is ${top}.`} />
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
          <svg className="viz max-w-[560px]" viewBox="0 0 600 344" role="img" aria-label={`Your answers on the assertiveness and cooperativeness chart, closest to ${top}`}>
            <line className="grid-line" x1={60} y1={300} x2={580} y2={300} />
            <line className="grid-line" x1={60} y1={20} x2={60} y2={300} />
            <text x={320} y={330} textAnchor="middle">COOPERATIVENESS →</text>
            <text x={22} y={160} textAnchor="middle" transform="rotate(-90 22 160)">ASSERTIVENESS →</text>
            {Object.entries(TKI_MODES).map(([k, p]) => (
              <g key={k}>
                <circle cx={60 + p[1] * 500} cy={300 - p[0] * 270} r={k === top ? 9 : 7} className={k === top ? "fill-ink" : "node"} />
                <text x={60 + p[1] * 500} y={300 - p[0] * 270 - 16} textAnchor="middle" className="lbl">
                  {k}
                </text>
              </g>
            ))}
            <circle cx={60 + pos[1] * 500} cy={300 - pos[0] * 270} r={13} className="fill-signal" />
            <text x={60 + pos[1] * 500} y={300 - pos[0] * 270 + 4} textAnchor="middle" style={{ fill: "var(--signal-foreground)", fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 10 }}>
              YOU
            </text>
          </svg>
        </div>
        <Disclaimer>
          For fun, not a validated assessment or the Thomas-Kilmann instrument.{" "}
          <Link href="/learn/s7/" className="font-semibold text-foreground underline-offset-4 hover:underline">
            Open sheet S07
          </Link>
        </Disclaimer>
      </GameShell>
    )
  }

  return (
    <GameShell kind="Quiz · 6 situations" title="How do you fight?">
      <ProgressLine value={step} max={CONFLICT_QUIZ.length} label="SITUATION" />
      <fieldset key={step} className="grid gap-3 animate-in fade-in slide-in-from-right-2 duration-300">
        <legend className="mb-4 text-2xl leading-snug font-semibold tracking-[-0.01em] text-balance">{Q.q}</legend>
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

function topMode(picks: string[]) {
  const t: Record<string, number> = {}
  picks.forEach((p) => (t[p] = (t[p] ?? 0) + 1))
  // ties go to the mode chosen first
  return Object.keys(t).sort((a, b) => t[b] - t[a] || picks.indexOf(a) - picks.indexOf(b))[0]
}

/* ─────────────── Bias blitz ─────────────── */

const BLITZ_SECONDS = 60

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
  const [misses, setMisses] = React.useState<[string, string][]>([])
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
    if (ok) {
      setScore((s) => s + 1)
      setStreak((s) => s + 1)
    } else {
      setStreak(0)
      setMisses((m) => [...m, item])
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
          Name the trap in each pitch. You have 60 seconds.
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
    return (
      <GameShell kind="Time" title="Bias blitz">
        <div className="relative grid gap-2">
          <Burst fire={fire} />
          <p className="font-mono text-7xl leading-none font-medium tracking-tight tnum"><Num value={score} /></p>
          <p className="text-muted-foreground" role="status">
            {newBest ? "New best." : `Best so far: ${best}.`} {uniq.length ? `${uniq.length} to review below.` : "No misses."}
          </p>
        </div>
        {uniq.length > 0 && (
          <ul className="grid gap-2 border-t border-border pt-4">
            {uniq.map(([p, b]) => (
              <li key={p} className="grid gap-0.5 text-[15px] sm:grid-cols-[minmax(0,1fr)_10rem] sm:gap-4">
                <span>{p}</span>
                <span className="font-semibold">{b}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap gap-2">
          <Button onClick={start}>
            <RotateCcw className="size-4" /> Play again
          </Button>
          <Button asChild variant="outline">
            <Link href="/learn/s8/">Open sheet S08</Link>
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
          <Num value={left} prefix="0:" pad={2} />
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-border" aria-hidden>
        <div className="h-full bg-foreground transition-[width] duration-200 ease-linear" style={{ width: `${(left / BLITZ_SECONDS) * 100}%` }} />
      </div>
      <p className="sr-only" aria-live="polite">
        {left % 15 === 0 && left > 0 ? `${left} seconds left. Score ${score}.` : ""}
      </p>
      <blockquote key={i} className="min-h-28 border-l-2 border-foreground pl-5 text-2xl leading-snug font-semibold tracking-[-0.01em] text-balance animate-in fade-in slide-in-from-right-2 duration-200 sm:text-3xl">
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
                "flex min-h-12 items-center gap-3 rounded-md border border-border bg-background/40 px-4 py-3 text-left text-[15px] font-medium transition-colors",
                !flash && "hover:border-foreground/60",
                isAns && "border-ok bg-ok text-background",
                isWrong && "nudge text-muted-foreground line-through"
              )}
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-[4px] border border-current/30 font-mono text-[11px]">{k + 1}</span>
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
  const steps = fwById("kotter-8")!.rows.map((r) => r[0].replace(/^\d+ /, ""))
  const [tiles, setTiles] = React.useState<number[] | null>(null)
  const [next, setNext] = React.useState(0)
  const [bad, setBad] = React.useState<number | null>(null)
  const [t0, setT0] = React.useState(0)
  const [penalty, setPenalty] = React.useState(0)
  const [now, setNow] = React.useState(0)
  const [final, setFinal] = React.useState<number | null>(null)
  const [fire, setFire] = React.useState(0)
  const [newBest, setNewBest] = React.useState(false)

  const start = () => {
    setTiles(shuffle(steps.map((_, i) => i)))
    setNext(0)
    setBad(null)
    setPenalty(0)
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
                    "relative flex min-h-20 flex-col items-start justify-between gap-2 rounded-md border border-border bg-background/40 p-3 text-left text-[15px] leading-snug font-semibold transition-[border-color,background-color,opacity]",
                    !placed && "hover:border-foreground/60",
                    placed && "border-foreground bg-foreground text-background",
                    bad === s && "nudge border-signal"
                  )}
                >
                  <span className={cn("font-mono text-[11px] font-medium", placed ? "text-background/70" : "text-muted-foreground")}>{placed ? `STEP ${s + 1}` : "?"}</span>
                  {steps[s]}
                </button>
              )
            })}
          </div>
          {final != null && (
            <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4" role="status">
              <p className="mr-2 text-[15px]">
                <b className="font-semibold">{secs(final)} seconds.</b> {newBest ? "New best." : `Best: ${secs(best)}s.`}
              </p>
              <Button onClick={start}>
                <RotateCcw className="size-4" /> Climb again
              </Button>
              <Button asChild variant="outline">
                <Link href="/learn/s5/">Open sheet S05</Link>
              </Button>
            </div>
          )}
        </>
      )}
    </GameShell>
  )
}
