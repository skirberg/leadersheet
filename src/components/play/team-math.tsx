"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, Check as CheckIcon, RotateCcw, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RangeField } from "@/components/labs/kit"
import { Num } from "@/components/motion/number"
import { useProgress, useReducedMotion } from "@/lib/store"
import { lessonPath } from "@/data/course"
import { ROUNDS, added, busiest, lightest, maxPods, pairs, podSizes, splitLines, teamShareText, verdict } from "@/lib/team-math"
import { cn } from "@/lib/utils"
import { Burst } from "./burst"
import { Disclaimer, GameShell, ProgressLine } from "./games"
import { ShareResult } from "./share"

/*
  Team math, paced after Nicky Case's playable posts: a bet before the reveal, one idea (lines grow far faster than
  people), the drag, then a plot twist in the round (split too far and the leads drown). The drawing is the control,
  as in Bartosz Ciechanowski's pieces: drag across it to add or remove people; the slider under it is the same control
  for keyboards and screen readers.
*/

const MIN = 3,
  MAX = 20,
  BETS = [30, 45, 66] as const

/* ─────────────── The ring ─────────────── */

const ease = (k: number) => 1 - Math.pow(1 - k, 3)

/** Seat angles for n people in p pods: a ring with a small gap between pods so the groups read at a glance. */
function seats(n: number, p: number) {
  const sizes = podSizes(n, p)
  const gap = sizes.length > 1 ? 0.9 : 0
  const step = (2 * Math.PI) / (n + gap * sizes.length)
  const out: { a: number; pod: number; lead: boolean }[] = []
  let i = 0
  sizes.forEach((s, j) => {
    for (let k = 0; k < s; k++, i++) out.push({ a: -Math.PI / 2 + (i + gap * j) * step, pod: j, lead: k === 0 })
  })
  return out
}

/** Angles that glide to their new places when the team grows, shrinks or splits. Still under reduced motion. */
function useGlide(target: number[], ms = 420) {
  const rm = useReducedMotion()
  const [cur, setCur] = React.useState(target)
  const ref = React.useRef(target)
  const key = target.map((a) => a.toFixed(4)).join(",")
  React.useEffect(() => {
    const goal = key.split(",").map(Number)
    if (rm) {
      ref.current = goal
      setCur(goal)
      return
    }
    const from = ref.current
    const t0 = performance.now()
    let raf = 0
    const tick = (t: number) => {
      const e = ease(Math.min(1, (t - t0) / ms))
      const next = goal.map((a, i) => (from[i] === undefined ? a : from[i] + (a - from[i]) * e))
      ref.current = next
      setCur(next)
      if (e < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [key, ms, rm])
  return cur.length === target.length ? cur : target
}

export function Ring({
  n,
  pods = 1,
  fresh,
  mark,
  onDrag,
  label,
}: {
  n: number
  pods?: number
  /** The newest person, whose lines are drawn in pink: what one more person costs. */
  fresh?: number
  /** Mark the busiest person and their lines in pink. */
  mark?: boolean
  onDrag?: (n: number) => void
  label: string
}) {
  const R = 132
  const s = seats(n, pods)
  const angles = useGlide(s.map((x) => x.a))
  const pt = (i: number) => [Math.cos(angles[i]) * R, Math.sin(angles[i]) * R] as const
  const split = pods > 1
  const hot = mark ? 0 : -1 // the lead of the biggest pod sits first
  const lines: React.ReactNode[] = []
  const thin = n > 12 ? 1 : 1.5
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) {
      const same = s[i].pod === s[j].pod
      if (split && !same && !(s[i].lead && s[j].lead)) continue
      const pink = (fresh !== undefined && (i === fresh || j === fresh)) || (hot >= 0 && (i === hot || j === hot))
      const [x1, y1] = pt(i),
        [x2, y2] = pt(j)
      lines.push(
        <line
          key={`${i}-${j}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          className={cn(pink ? "edge-signal" : split && !same ? "edge-ink" : "edge", pink && fresh !== undefined && "fresh")}
          strokeWidth={pink ? 2 : thin}
        />
      )
    }
  // Drag sideways across the drawing to change the team: a finger's width per person. Vertical drags still scroll.
  const drag = React.useRef<{ x: number; n: number; per: number } | null>(null)
  return (
    <svg
      viewBox="-160 -160 320 320"
      className={cn("viz mx-auto w-full max-w-[250px] select-none sm:max-w-[360px]", onDrag && "cursor-ew-resize touch-pan-y")}
      role="img"
      aria-label={label}
      onPointerDown={
        onDrag &&
        ((e) => {
          const w = e.currentTarget.getBoundingClientRect().width
          drag.current = { x: e.clientX, n, per: Math.max(14, w / (MAX - MIN + 3)) }
          e.currentTarget.setPointerCapture(e.pointerId)
        })
      }
      onPointerMove={
        onDrag &&
        ((e) => {
          const d = drag.current
          if (!d) return
          const next = Math.max(MIN, Math.min(MAX, d.n + Math.round((e.clientX - d.x) / d.per)))
          if (next !== n) onDrag(next)
        })
      }
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
    >
      {lines}
      {s.map((x, i) => {
        const [cx, cy] = pt(i)
        const pink = i === fresh || i === hot
        return <circle key={i} cx={cx} cy={cy} r={8} className={pink ? "fill-signal" : split && x.lead ? "fill-ink" : "node"} />
      })}
    </svg>
  )
}

/* ─────────────── People against lines ─────────────── */

function Curve({ n }: { n: number }) {
  const X = (k: number) => 14 + ((k - MIN) / (MAX - MIN)) * 270
  const Y = (v: number) => 88 - (v / pairs(MAX)) * 78
  const line = (f: (k: number) => number) => Array.from({ length: MAX - MIN + 1 }, (_, i) => `${i ? "L" : "M"}${X(i + MIN).toFixed(1)} ${Y(f(i + MIN)).toFixed(1)}`).join("")
  return (
    <svg viewBox="0 0 330 100" className="viz w-full max-w-[420px]" role="img" aria-label={`People and lines from 3 to 20. At ${n} people, ${pairs(n)} lines.`}>
      <path d="M14 88H284" className="grid-line" />
      <path d={line((k) => k)} className="edge" strokeDasharray="3 4" />
      <path d={line(pairs)} className="edge-ink" strokeWidth={2} />
      <line x1={X(n)} x2={X(n)} y1={88} y2={Y(pairs(n))} className="grid-line" />
      <circle cx={X(n)} cy={Y(pairs(n))} r={5} className="fill-ink" />
      <text x={290} y={Y(pairs(MAX)) + 4}>lines</text>
      <text x={290} y={Y(MAX) + 4}>people</text>
    </svg>
  )
}

/** One line for where the drag is: plain facts, from the formula and Hackman's rule of thumb. */
function milestone(n: number) {
  if (n < 6) return "Small enough that everyone talks to everyone."
  if (n === 6) return "Six people: 15 lines."
  if (n < 10) return "Each new person adds a line to everyone already there."
  if (n < 14) return "Double digits. Hackman’s rule of thumb for a team: no double digits."
  if (n === 14) return "Fourteen: 91 lines. Six times a team of six, for a bit over twice the people."
  if (n < MAX) return `Everyone now has ${n - 1} people to keep up with.`
  return "Twenty: 190 lines. This is why teams split."
}

/* ─────────────── The game ─────────────── */

type Pick = { n: number; p: number }

export function TeamMathGame() {
  const { lab, setLab } = useProgress()
  const rm = useReducedMotion()
  const best = lab<number | null>("g-team-best", null)
  const [stage, setStage] = React.useState<"bet" | "drag" | "round" | "done">("bet")
  const [bet, setBet] = React.useState<number | null>(null)
  const [n, setN] = React.useState(6)
  const [fresh, setFresh] = React.useState<number | undefined>(undefined)
  const [growing, setGrowing] = React.useState(false)
  // Until the first drag after the reveal, the line under the number answers the bet.
  const [moved, setMoved] = React.useState(false)
  const [r, setR] = React.useState(0)
  const [pods, setPods] = React.useState(1)
  const [locked, setLocked] = React.useState(false)
  const [picks, setPicks] = React.useState<Pick[]>([])
  const [fire, setFire] = React.useState(0)
  // The reveal's timer, stopped if the visitor leaves mid-reveal.
  const timer = React.useRef(0)
  React.useEffect(() => () => window.clearInterval(timer.current), [])

  const move = (next: number) => {
    setFresh(next > n ? next - 1 : undefined)
    setN(next)
    setMoved(true)
  }

  // The bet's reveal: the team grows from six to twelve in front of you, one person at a time. Once: a double tap
  // before the screen changes must not start a second reveal.
  const placed = React.useRef(false)
  const place = (b: number) => {
    if (placed.current) return
    placed.current = true
    setBet(b)
    setMoved(false)
    setStage("drag")
    if (rm) {
      setN(12)
      return
    }
    setGrowing(true)
    let k = 6
    timer.current = window.setInterval(() => {
      k += 1
      setFresh(k - 1)
      setN(k)
      if (k >= 12) {
        window.clearInterval(timer.current)
        setGrowing(false)
      }
    }, 260)
  }

  const startRound = () => {
    setStage("round")
    setR(0)
    setPods(1)
    setLocked(false)
    setPicks([])
  }
  const lock = () => {
    const next = [...picks, { n: ROUNDS[r], p: pods }]
    setPicks(next)
    setLocked(true)
  }
  const nextTeam = () => {
    if (r + 1 < ROUNDS.length) {
      setR(r + 1)
      setPods(1)
      setLocked(false)
      return
    }
    const score = picks.filter((x) => verdict(x.n, x.p) === "lightest").length
    if (best === null || score > best) setLab("g-team-best", score)
    setStage("done")
    setFire((f) => f + 1)
  }

  if (stage === "bet")
    return (
      <GameShell kind="Drag · 3 min" title="Team math">
        <div className="grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Ring n={6} label="Six people, every pair joined by a line: 15 lines." />
          <div className="grid content-start gap-4">
            <p className="t-question sm:text-3xl">Six people. Every pair is a line to keep up: 15 lines.</p>
            <p className="text-lg text-muted-foreground">Double the team to twelve. How many lines?</p>
            <div className="grid grid-cols-3 gap-2" role="group" aria-label="Your guess">
              {BETS.map((b) => (
                <Button key={b} variant="outline" size="lg" className="text-lg tnum" onClick={() => place(b)}>
                  {b}
                </Button>
              ))}
            </div>
            {best !== null && <p className="text-sm text-muted-foreground tnum">Your best round: {best} of {ROUNDS.length}.</p>}
          </div>
        </div>
      </GameShell>
    )

  if (stage === "drag") {
    const right = bet === 66
    return (
      <GameShell kind="Drag · 3 min" title="Team math">
        <div className="grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Ring n={n} fresh={fresh} onDrag={growing ? undefined : move} label={`${n} people, ${pairs(n)} lines between them.`} />
          <div className="grid content-start gap-4">
            <p className="flex flex-wrap items-baseline gap-x-3">
              <span className="font-mono text-7xl leading-none font-medium tracking-tight tnum">
                <Num value={pairs(n)} />
              </span>
              <span className="text-lg text-muted-foreground">lines, {n} people</span>
            </p>
            <p className="min-h-14 text-lg leading-snug font-semibold text-balance" role="status">
              {growing
                ? `Person ${n} adds ${added(n)} ${added(n) === 1 ? "line" : "lines"}.`
                : !moved && bet !== null
                  ? right
                    ? "Right. Twice the people, more than four times the lines."
                    : `Not ${bet}: 66. Twice the people, more than four times the lines.`
                  : milestone(n)}
            </p>
            {!growing && <Curve n={n} />}
          </div>
        </div>
        {!growing && (
          <div className="grid gap-5 border-t border-border pt-5">
            <RangeField id="team-n" label="People" ariaLabel="People on the team" value={n} min={MIN} max={MAX} onChange={move} format={(v) => `${v} of ${MAX}`} />
            <div className="flex flex-wrap items-center justify-end gap-3">
              <Button onClick={startRound}>
                Now split a team <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </GameShell>
    )
  }

  if (stage === "round") {
    const size = ROUNDS[r]
    const mine = picks[r]
    const v = mine && verdict(mine.n, mine.p)
    const light = lightest(size)
    const sizes = podSizes(size, pods)
    return (
      <GameShell kind={`Team ${r + 1} of ${ROUNDS.length}`} title="Team math">
        <ProgressLine value={r} max={ROUNDS.length} label="Team" />
        <div className="grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Ring n={size} pods={pods} mark={locked} label={`${size} people in ${sizes.length === 1 ? "one team" : `${sizes.length} pods`}, ${splitLines(size, pods)} lines.`} />
          <div className="grid content-start gap-4">
            <p className="t-question sm:text-3xl">
              {r === 0 ? "The team is nine. Where do you split it?" : r === 1 ? "It grew to fourteen. Split it again." : "Now twenty."}
            </p>
            <p className="text-base">Each pod gets a lead, and only the leads talk across pods.</p>
            {!locked ? (
              <>
                <RangeField
                  id={`team-pods-${r}`}
                  label="Pods"
                  value={pods}
                  min={1}
                  max={maxPods(size)}
                  onChange={setPods}
                  format={(p) => (p === 1 ? "One team" : sizes[0] === sizes[sizes.length - 1] ? `${p} pods of ${sizes[0]}` : `${p} pods of ${sizes[sizes.length - 1]} or ${sizes[0]}`)}
                />
                <div>
                  <Button onClick={lock}>Split it here</Button>
                </div>
              </>
            ) : (
              <div className="grid gap-3" role="status">
                <p className="flex items-baseline gap-3">
                  <span className="font-mono text-6xl leading-none font-medium tnum">{busiest(size, pods)}</span>
                  <span className="text-lg text-muted-foreground">people for the busiest one to keep up with</span>
                </p>
                <p className="text-base leading-relaxed">
                  {v === "lightest" ? (
                    <b className="font-semibold text-ok">As light as it gets.</b>
                  ) : (
                    <b className="font-semibold">{v === "close" ? "One off the lightest." : "Heavy."}</b>
                  )}{" "}
                  {pods === 1
                    ? `One team: everyone keeps up with ${size - 1} others.`
                    : pods < light.pods[0]
                      ? `Pods of ${sizes[0]} keep a lot of lines inside them.`
                      : pods > light.pods[light.pods.length - 1]
                        ? `So many pods that the leads drown: each keeps up with ${pods - 1} other leads.`
                        : `The lead of a pod of ${sizes[0]} keeps up with ${sizes[0] - 1} in the pod and ${pods - 1} other ${pods === 2 ? "lead" : "leads"}.`}{" "}
                  {v !== "lightest" && `The lightest: ${andOr(light.pods)} pods, ${light.busiest} each.`}
                </p>
                <p className="text-sm text-muted-foreground tnum">
                  {splitLines(size, pods)} lines in all, against {pairs(size)} for one team.
                </p>
                <div>
                  <Button onClick={nextTeam}>
                    {r + 1 < ROUNDS.length ? "Next team" : "See how you did"} <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </GameShell>
    )
  }

  const score = picks.filter((x) => verdict(x.n, x.p) === "lightest").length
  return (
    <GameShell title="Team math">
      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
        <Burst fire={fire} />
        <div className="grid content-start gap-4">
          <p className="font-serif text-6xl leading-none tracking-[-0.02em] tnum">
            {score} of {ROUNDS.length}
          </p>
          <p className="text-lg text-pretty text-muted-foreground">
            {score === ROUNDS.length ? "Every split as light as it gets." : "The lightest split sits near the square root of the team: 3 pods for 9 people, 4 or 5 for 20."}
          </p>
          <p className="-mb-2 border-t border-border pt-4 text-right text-sm text-muted-foreground">Busiest / lightest</p>
          <ul className="grid gap-2">
            {picks.map((x) => {
              const v = verdict(x.n, x.p)
              return (
                <li key={x.n} className="grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-3 text-base">
                  <span aria-hidden className={cn("grid size-5 place-items-center rounded-full border border-rule/70", v === "lightest" && "border-ok bg-ok text-background", v === "heavy" && "border-foreground")}>
                    {v === "lightest" ? <CheckIcon className="size-3" strokeWidth={3} /> : v === "heavy" ? <X className="size-3" strokeWidth={3} /> : <span className="block size-1.5 rounded-full bg-foreground" />}
                  </span>
                  <span>
                    {x.n} people, {x.p === 1 ? "one team" : `${x.p} pods`}
                  </span>
                  <span className="font-mono text-sm text-muted-foreground tnum">
                    {busiest(x.n, x.p)} <span className="sr-only">lines for the busiest person, lightest possible </span>
                    <span aria-hidden>/ </span>
                    {lightest(x.n).busiest}
                  </span>
                </li>
              )
            })}
          </ul>
          <div className="flex flex-wrap gap-2 pt-2">
            <ShareResult text={teamShareText(score, picks[picks.length - 1])} path="/play/team/" image="/og/team.png" fileName="leadersheet-team-math.png" />
            <Button variant="ghost" onClick={startRound}>
              <RotateCcw className="size-4" /> Split again
            </Button>
          </div>
        </div>
        <Ring n={20} pods={picks[2]?.p ?? 1} mark label={`Your last split: 20 people in ${picks[2]?.p ?? 1} pods.`} />
      </div>
      <Disclaimer>
        These are lines that could be kept up, not talks that happen. Pods buy fewer lines with leads who carry what crosses them, and a small pod has little room for different views (Hill, 2005). After Brooks (1975) and Hackman (2009).{" "}
        <Link href={lessonPath("s6")} className="font-semibold text-foreground underline-offset-4 hover:underline">
          Open lesson 6
        </Link>
        {" · "}
        <Link href="/sheet/" className="font-semibold text-foreground underline-offset-4 hover:underline">
          Your sheet
        </Link>
      </Disclaimer>
    </GameShell>
  )
}

const andOr = (xs: number[]) => (xs.length < 2 ? String(xs[0]) : `${xs.slice(0, -1).join(", ")} or ${xs[xs.length - 1]}`)
