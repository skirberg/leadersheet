"use client"

import * as React from "react"
import { Check as CheckIcon, Pause, Play, RotateCcw, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Num } from "@/components/motion/number"
import { LabFrame, Meter, RangeField, Readout, Segmented, Sorter } from "./kit"
import { useProgress } from "@/lib/store"
import { fwById } from "@/data/course"
import {
  ADAPTIVE_ITEMS,
  CULTURE_SCALES,
  DISENGAGE_ITEMS,
  FOUR_I_ITEMS,
  GROW_ITEMS,
  INTEREST_ITEMS,
  JUSTICE_ITEMS,
  LISTEN_REPLIES,
  LISTEN_STEPS,
  POWER_BUCKETS,
  POWER_ITEMS,
  STYLE_BUCKETS,
  STYLE_ITEMS,
  TRUST_TIPS,
  VOICE_ITEMS,
  WEEK_ROWS,
} from "@/data/labs"
import { cn } from "@/lib/utils"

const buckets = (keys: string[]) => keys.map((k) => ({ key: k, label: k }))

/* S13 · Bases of power */
export function PowerLab() {
  return (
    <LabFrame code="Lab 12.A" title="Name the base of power">
      <Sorter items={POWER_ITEMS} buckets={buckets(POWER_BUCKETS)} hint="Ask what the person believes about the one with power." />
    </LabFrame>
  )
}

/* S14 · Six styles */
export function StylesLab() {
  return (
    <LabFrame code="Lab 13.A" title="Which style is talking?">
      <Sorter items={STYLE_ITEMS} buckets={buckets(STYLE_BUCKETS)} hint="Listen for the phrase each style is known by." />
    </LabFrame>
  )
}

/* S15 · The full range, from Judge and Piccolo's meta-analysis */
const RANGE: [name: string, r: number][] = [
  ["Transformational", 0.44],
  ["Contingent reward", 0.39],
  ["Laissez-faire", -0.37],
]

export function FullRangeLab() {
  const [shown, setShown] = React.useState(false)
  return (
    <div className="grid gap-6">
      <LabFrame code="Lab 14.A" title="How much does each style matter?">
        <div className="grid gap-3" role="img" aria-label="Overall validity: transformational .44, contingent reward .39, laissez-faire minus .37">
          {RANGE.map(([n, r]) => (
            <div key={n} className="grid grid-cols-[minmax(0,1fr)_3rem] items-center gap-x-3 gap-y-1 text-sm @xl:grid-cols-[minmax(0,9rem)_minmax(0,1fr)_3rem]">
              <span className="col-span-2 @xl:col-span-1">{n}</span>
              <div className="relative h-7 rounded-[3px] bg-border/60">
                <span aria-hidden className="absolute inset-y-0 left-1/2 w-px bg-foreground/50" />
                <div
                  className={cn("absolute inset-y-0 rounded-[3px] transition-all duration-(--dur-draw) ease-(--ease-draft)", r < 0 ? "bg-signal" : "bg-foreground/80")}
                  style={shown ? (r < 0 ? { right: "50%", width: `${-r * 100}%` } : { left: "50%", width: `${r * 100}%` }) : { left: "50%", width: 0 }}
                />
              </div>
              <span className="text-right font-mono text-sm font-medium tnum">{shown ? r.toFixed(2).replace("0.", ".") : "?"}</span>
            </div>
          ))}
        </div>
        <div>
          <Button onClick={() => setShown((v) => !v)}>{shown ? "Hide" : "Reveal"}</Button>
        </div>
      </LabFrame>
      <LabFrame code="Lab 14.B" title="Spot the four parts of transformational leadership">
        <Sorter
          items={FOUR_I_ITEMS}
          buckets={buckets(["Idealized", "Inspirational", "Intellectual", "Individualized"])}
          hint="Bass and Avolio’s four parts."
        />
      </LabFrame>
    </div>
  )
}

/* S16 · Trust and fairness */
const ABI = ["Ability", "Benevolence", "Integrity"]

export function TrustLab() {
  const { lab, setLab } = useProgress()
  const t = lab<number[]>("abi", [5, 5, 5])
  const lo = t.indexOf(Math.min(...t))
  const even = t.every((x) => x === t[0])
  return (
    <div className="grid gap-6">
      <LabFrame code="Lab 15.A" title="Rate someone you need to trust">
        {ABI.map((k, i) => (
          <RangeField key={k} id={`abi-${i}`} label={k} value={t[i]} min={1} max={7} onChange={(v) => setLab("abi", t.map((x, j) => (j === i ? v : x)))} format={(v) => `${v} of 7`} />
        ))}
        <Readout>{even ? "All three match. If trust still feels low, look at the risk you are being asked to take." : `Weakest: ${ABI[lo]}. ${TRUST_TIPS[ABI[lo]]}`}</Readout>
      </LabFrame>
      <LabFrame code="Lab 15.B" title="Which kind of fairness?">
        <Sorter items={JUSTICE_ITEMS} buckets={buckets(["Distributive", "Procedural", "Interpersonal", "Informational"])} hint="Outcome, process, respect or reasons." />
      </LabFrame>
    </div>
  )
}

/* S17 · Moral disengagement */
export function EthicsLab() {
  return (
    <LabFrame code="Lab 16.A" title="How is the conscience being switched off?">
      <Sorter
        items={DISENGAGE_ITEMS}
        buckets={[
          { key: "Recast", label: "Recast the act" },
          { key: "Hide", label: "Hide your part" },
          { key: "Shrink", label: "Shrink the harm" },
          { key: "Blame", label: "Blame the victim" },
        ]}
        hint="Bandura’s four ways people disengage."
      />
    </LabFrame>
  )
}

/* S18 · The bargaining zone */
export function NegotiateLab() {
  const { lab, setLab } = useProgress()
  const [sell, buy, first] = lab<number[]>("zopa", [40, 60, 75])
  const zone = buy >= sell
  const X = (v: number) => 20 + v * 3.8
  const set = (i: number) => (v: number) => setLab("zopa", [sell, buy, first].map((x, j) => (j === i ? v : x)))
  return (
    <div className="grid gap-6">
      <LabFrame code="Lab 17.A" title="Find the zone of possible agreement">
        <RangeField id="z-sell" label="Seller’s walk-away: the least they will take" value={sell} min={0} max={100} onChange={set(0)} format={(v) => `$${v}k`} />
        <RangeField id="z-buy" label="Buyer’s walk-away: the most they will pay" value={buy} min={0} max={100} onChange={set(1)} format={(v) => `$${v}k`} />
        <RangeField id="z-first" label="Seller’s first offer" value={first} min={0} max={100} onChange={set(2)} format={(v) => `$${v}k`} />
        <svg viewBox="0 0 420 92" className="viz w-full max-w-[520px]" role="img" aria-label={zone ? `Zone of possible agreement from ${sell} to ${buy} thousand dollars` : "No zone of possible agreement"}>
          <line x1={20} y1={50} x2={400} y2={50} className="grid-line" />
          {zone && <rect x={X(sell)} y={38} width={Math.max(2, X(buy) - X(sell))} height={24} rx={4} className="fill-signal" opacity={0.85} />}
          <line x1={X(sell)} y1={26} x2={X(sell)} y2={74} className="edge-ink" strokeWidth={2} />
          <line x1={X(buy)} y1={26} x2={X(buy)} y2={74} className="edge-ink" strokeWidth={2} />
          <text x={X(sell)} y={18} textAnchor="middle" className="lbl">Seller</text>
          <text x={X(buy)} y={88} textAnchor="middle" className="lbl">Buyer</text>
          <path d={`M${X(first)} 30 l-6 -10 h12 z`} className="fill-ink" />
          <text x={X(first)} y={14} textAnchor="middle" className="lbl">First offer</text>
        </svg>
        <Readout>
          {zone
            ? `A deal can land anywhere from $${sell}k to $${buy}k. ${first > buy ? "The first offer sits above what the buyer can pay, but it still pulls the talk upward." : first < sell ? "The seller opened below their own walk-away, which gives away value." : "The first offer sits inside the zone and anchors the talk there."}`
            : "No zone. Each side does better with its alternative, so walking away is the right result."}
        </Readout>
      </LabFrame>
      <LabFrame code="Lab 17.B" title="Position or interest?">
        <Sorter items={INTEREST_ITEMS} buckets={buckets(["Position", "Interest"])} hint="A position is what someone demands; the interest is why." />
      </LabFrame>
    </div>
  )
}

/* S19 · The continuum and GROW */
export function CoachLab() {
  const { lab, setLab } = useProgress()
  const p = lab<number>("cont", 4)
  const rows = fwById("continuum-7")!.rows
  return (
    <div className="grid gap-6">
      <LabFrame code="Lab 18.A" title="Slide from deciding alone to letting the team decide">
        <RangeField id="cont" label="Point on the line" value={p} min={1} max={7} onChange={(v) => setLab("cont", v)} format={(v) => `${v} of 7`} />
        <div className="grid gap-2.5">
          <Meter label="Your authority" value={8 - p} max={7} suffix="" />
          <Meter label="Team’s freedom" value={p} max={7} suffix="" />
        </div>
        <Readout>{rows[p - 1][1]}.</Readout>
      </LabFrame>
      <LabFrame code="Lab 18.B" title="Which step of GROW is this question?">
        <Sorter
          items={GROW_ITEMS}
          buckets={[
            { key: "G", label: "Goal" },
            { key: "R", label: "Reality" },
            { key: "O", label: "Options" },
            { key: "W", label: "Will" },
          ]}
          hint="Goal, Reality, Options, Will."
        />
      </LabFrame>
    </div>
  )
}

/* S20 · One weak tie across a gap */
const NODES: [x: number, y: number][] = [
  [80, 50], [150, 30], [150, 110], [80, 130], [40, 90],
  [450, 40], [520, 60], [530, 130], [460, 140], [410, 95],
]
const EDGES: [number, number][] = [
  [0, 1], [0, 2], [0, 3], [0, 4], [1, 2], [2, 3], [3, 4], [1, 4],
  [5, 6], [6, 7], [7, 8], [8, 9], [9, 5], [5, 7], [6, 8],
]
const reach = (edges: [number, number][], from: number, steps: number) => {
  let seen = new Set([from])
  let edge = new Set([from])
  for (let s = 0; s < steps; s++) {
    const next = new Set<number>()
    edge.forEach((n) => edges.forEach(([a, b]) => (a === n && !seen.has(b) ? next.add(b) : b === n && !seen.has(a) ? next.add(a) : null)))
    next.forEach((n) => seen.add(n))
    edge = next
  }
  return seen.size - 1
}

export function NetworkLab() {
  const { lab, setLab } = useProgress()
  const bridge = lab<"close" | "bridge">("net", "close")
  const edges: [number, number][] = bridge === "bridge" ? [...EDGES, [0, 9]] : EDGES
  const r = reach(edges, 0, 2)
  return (
    <LabFrame code="Lab 19.A" title="Add one weak tie across the gap">
      <Segmented
        label="Your network"
        value={bridge}
        onChange={(v) => setLab("net", v)}
        options={[
          { value: "close", label: "Only close ties" },
          { value: "bridge", label: "Add one weak tie" },
        ]}
      />
      <svg viewBox="0 0 580 170" className="viz w-full max-w-[520px]" role="img" aria-label={`Two groups of five. You can reach ${r} people within two steps.`}>
        {edges.map(([a, b], i) => (
          <line
            key={i}
            x1={NODES[a][0]}
            y1={NODES[a][1]}
            x2={NODES[b][0]}
            y2={NODES[b][1]}
            className={i >= EDGES.length ? "edge-signal" : "edge-ink"}
            strokeDasharray={i >= EDGES.length ? "5 5" : undefined}
            strokeWidth={i >= EDGES.length ? 2 : 1.2}
          />
        ))}
        {NODES.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i === 0 ? 12 : 8} className={i === 0 ? "fill-signal" : i < 5 ? "fill-ink" : "node"} />
        ))}
        <text x={80} y={54} textAnchor="middle" style={{ fill: "var(--signal-foreground)", fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 9 }}>
          You
        </text>
      </svg>
      <Meter label="People within two steps" value={r} max={9} suffix={String(r)} />
      <Readout>
        {bridge === "bridge"
          ? `One acquaintance in the other group puts ${r - 4} more people within two steps, and they hear news your circle does not.`
          : "Everyone you can reach knows the same people you do."}
      </Readout>
    </LabFrame>
  )
}

/* S21 · Where two cultures sit on a scale */
export function CulturesLab() {
  const { lab, setLab } = useProgress()
  const k = lab<number>("cm-k", 1)
  const pos = lab<number[][]>("cm", CULTURE_SCALES.map(() => [3, 7]))
  const [you, them] = pos[k]
  const gap = Math.abs(you - them)
  const [, left, right] = CULTURE_SCALES[k]
  const set = (i: number) => (v: number) => setLab("cm", pos.map((p, j) => (j === k ? p.map((x, q) => (q === i ? v : x)) : p)))
  const X = (v: number) => 24 + (v - 1) * 46.5
  return (
    <LabFrame code="Lab 20.A" title="Place yourself and a colleague on one scale">
      <Segmented label="Scale" value={String(k)} onChange={(v) => setLab("cm-k", Number(v))} options={CULTURE_SCALES.map((c, i) => ({ value: String(i), label: c[0] }))} />
      <RangeField id="cm-you" label="You" value={you} min={1} max={9} onChange={set(0)} format={(v) => `${v} of 9`} />
      <RangeField id="cm-them" label="Your colleague" value={them} min={1} max={9} onChange={set(1)} format={(v) => `${v} of 9`} />
      <svg viewBox="0 0 420 70" className="viz w-full max-w-[520px]" role="img" aria-label={`${CULTURE_SCALES[k][0]}: you at ${you}, colleague at ${them}, on a scale from ${left} to ${right}`}>
        <line x1={24} y1={30} x2={396} y2={30} className="grid-line" />
        <circle cx={X(you)} cy={30} r={10} className="fill-signal" />
        <circle cx={X(them)} cy={30} r={8} className="fill-ink" />
        <text x={14} y={62} className="lbl">{left}</text>
        <text x={406} y={62} textAnchor="end" className="lbl">{right}</text>
      </svg>
      <Readout>
        {gap <= 2
          ? "Close together. Small misreads are still possible, but you share a default."
          : gap <= 5
            ? "A real gap. Say out loud how you work on this scale before it causes a misread."
            : "Far apart. What feels normal to one of you will feel wrong to the other. Agree explicitly how you will work."}
      </Readout>
    </LabFrame>
  )
}

/* S22 · Technical or adaptive */
export function CrisisLab() {
  return (
    <LabFrame code="Lab 21.A" title="Technical problem or adaptive challenge?">
      <Sorter items={ADAPTIVE_ITEMS} buckets={buckets(["Technical", "Adaptive"])} hint="Adaptive work needs the people with the problem to change." />
    </LabFrame>
  )
}

/* S23 · Voice */
export function VoiceLab() {
  return (
    <LabFrame code="Lab 22.A" title="Does this open voice or shut it down?">
      <Sorter
        items={VOICE_ITEMS}
        buckets={[
          { key: "Opens", label: "Opens voice" },
          { key: "Shuts", label: "Shuts it down" },
        ]}
        hint="Silence is the default. Small signals decide whether people speak."
      />
    </LabFrame>
  )
}

/* S24 · Last week against your goals */
export function SelfLab() {
  const { lab, setLab } = useProgress()
  const h = lab<number[]>("week", [6, 4, 2, 38])
  const total = h.reduce((a, b) => a + b, 0)
  const top = h[0] + h[1] + h[2]
  const share = total ? Math.round((top / total) * 100) : 0
  return (
    <LabFrame code="Lab 23.A" title="Audit last week against your top three goals">
      {WEEK_ROWS.map((l, i) => (
        <RangeField key={l} id={`wk-${i}`} label={l} value={h[i]} min={0} max={60} onChange={(v) => setLab("week", h.map((x, j) => (j === i ? v : x)))} format={(v) => `${v} h`} />
      ))}
      <div className="grid gap-2">
        <p className="label-mono">Share of the week on your top three goals</p>
        <p className="font-mono text-5xl leading-none font-medium tracking-tight tnum">
          <Num value={share} />%
          <span className="ml-2 font-sans text-base font-medium text-muted-foreground">of {total} hours</span>
        </p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-border" aria-hidden>
        <div className="h-full rounded-full bg-foreground transition-transform duration-(--dur-draw)" style={{ transform: `translateX(${share - 100}%)` }} />
      </div>
      <Readout>
        {share >= 50
          ? "Most of your week went to what you say matters most."
          : "Your calendar is your real strategy. Which hour next week can move to a top goal?"}
      </Readout>
    </LabFrame>
  )
}

/* S09 · Which reply listened? */
export function ReplyLab() {
  return (
    <LabFrame code="Lab 09.C" title="Which reply actually listened?">
      <div className="grid gap-6">
        {LISTEN_REPLIES.map((q, i) => (
          <Reply key={i} q={q} />
        ))}
      </div>
    </LabFrame>
  )
}

function Reply({ q }: { q: (typeof LISTEN_REPLIES)[number] }) {
  const [p, setP] = React.useState<number | null>(null)
  return (
    <div className="grid gap-2">
      <p className="text-base font-semibold">“{q.s}”</p>
      {q.o.map((o, j) => {
        const right = p != null && j === q.a
        const wrong = p === j && j !== q.a
        return (
          <button
            key={j}
            type="button"
            disabled={p != null}
            onClick={() => setP(j)}
            className={cn(
              "flex min-h-11 items-start gap-3 rounded-md border border-border bg-card px-4 py-2.5 text-left text-base transition-colors",
              p == null && "hover:border-foreground/50",
              right && "border-ok bg-ok/8",
              wrong && "text-muted-foreground line-through",
              p != null && !right && !wrong && "opacity-55"
            )}
          >
            <span aria-hidden className={cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-rule/70", right && "border-ok bg-ok text-background")}>
              {right && <CheckIcon className="size-3" strokeWidth={3} />}
              {wrong && <X className="size-3" strokeWidth={3} />}
            </span>
            {o}
          </button>
        )
      })}
      {p != null && <p role="status" className="text-base">{q.why}</p>}
    </div>
  )
}

/* S09 · Listening pairs, timed */
export function PairsLab() {
  const [step, setStep] = React.useState(0)
  const [left, setLeft] = React.useState(LISTEN_STEPS[0][1])
  const [running, setRunning] = React.useState(false)
  React.useEffect(() => {
    if (!running) return
    const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [running])
  React.useEffect(() => {
    if (!running || left > 0) return
    if (step < LISTEN_STEPS.length - 1) {
      setStep(step + 1)
      setLeft(LISTEN_STEPS[step + 1][1])
    } else setRunning(false)
  }, [left, running, step])
  const [phase, secs, what] = LISTEN_STEPS[step]
  const reset = () => {
    setRunning(false)
    setStep(0)
    setLeft(LISTEN_STEPS[0][1])
  }
  const done = step === LISTEN_STEPS.length - 1 && left === 0
  return (
    <LabFrame code="Lab 09.D" title="Listening pairs: five minutes with someone">
      <ol className="grid gap-1.5" aria-label="Rounds">
        {LISTEN_STEPS.map(([ph, s], i) => (
          <li key={i} className={cn("flex items-baseline justify-between gap-3 border-b border-border py-1.5 text-sm", i === step ? "font-semibold" : "text-muted-foreground")}>
            <span>{ph}</span>
            <span className="font-mono text-xs tnum">{s >= 60 ? `${s / 60} min` : `${s} s`}</span>
          </li>
        ))}
      </ol>
      <p className="font-mono text-5xl leading-none font-medium tracking-tight tnum" aria-live="off">
        {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
      </p>
      <div className="h-2 overflow-hidden rounded-full bg-border">
        <div className="h-full rounded-full bg-signal transition-transform duration-1000 ease-linear" style={{ transform: `translateX(${(left / secs) * 100 - 100}%)` }} />
      </div>
      <Readout>{done ? "Done. What did you hear that you would have missed if you had been planning your reply?" : `${phase}. ${what}`}</Readout>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => (done ? reset() : setRunning((r) => !r))}>
          {running ? <Pause className="size-4" /> : <Play className="size-4" />} {running ? "Pause" : done ? "Again" : "Start"}
        </Button>
        <Button variant="ghost" onClick={reset}>
          <RotateCcw className="size-4" /> Reset
        </Button>
      </div>
    </LabFrame>
  )
}
