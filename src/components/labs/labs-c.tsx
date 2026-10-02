"use client"

import * as React from "react"
import { Check as CheckIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CheckRow, LabFrame, Meter, RangeField, Readout, Segmented } from "./kit"
import { useProgress, useReducedMotion } from "@/lib/store"
import { fwById } from "@/data/course"
import {
  ENERGY_ITEMS,
  ENERGY_TIPS,
  EXPECTANCY_LABELS,
  FEEDBACK_CASES,
  JCM_LABELS,
  LADDER_PATHS,
  RESTATE,
} from "@/data/labs"
import { cn } from "@/lib/utils"

/* S09 · The tapping study and restating */
const BEATS = [0, 300, 600, 1000, 1400, 1800, 2400, 2700, 3000, 3400, 3800, 4200]

export function TapLab() {
  const [guess, setGuess] = React.useState(20)
  const [revealed, setRevealed] = React.useState(false)
  const [hit, setHit] = React.useState(false)
  const [msg, setMsg] = React.useState("")
  const rm = useReducedMotion()
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([])
  React.useEffect(() => () => timers.current.forEach(clearTimeout), [])
  const tap = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    if (rm) return setMsg("Knock, knock, knock... the melody you hear in your head is missing for the listener.")
    setMsg("")
    BEATS.forEach((b) => {
      timers.current.push(setTimeout(() => setHit(true), b))
      timers.current.push(setTimeout(() => setHit(false), b + 120))
    })
    timers.current.push(setTimeout(() => setMsg("To you that was the song. To a listener it was twelve knocks."), 4500))
  }
  const rows: [string, number, boolean][] = [
    ["Your guess", guess / 40, false],
    ["Tappers predicted", 0.5, false],
    ["Listeners got", 1 / 40, true],
  ]
  return (
    <div className="grid gap-6">
      <LabFrame code="Lab 09.A" title="The tapping study">
        <p className="text-[15px]">Imagine you tap the rhythm of Happy Birthday on a table. Out of 40 listeners, how many name the song?</p>
        <div className="flex items-center gap-4">
          <span
            aria-hidden
            className={cn(
              "grid size-14 place-items-center rounded-full border-2 border-foreground font-mono text-xs font-medium transition-transform duration-75",
              hit && "scale-115 bg-pencil text-background border-pencil"
            )}
          >
            tap
          </span>
          <Button variant="outline" onClick={tap}>Tap it</Button>
        </div>
        <RangeField id="tap-g" label="Your guess, out of 40" value={guess} min={0} max={40} onChange={(v) => setGuess(v)} format={(v) => `${v} of 40`} />
        <div>
          <Button onClick={() => setRevealed(true)}>Reveal</Button>
        </div>
        {revealed && (
          <div className="grid gap-2.5" role="img" aria-label={`Your guess ${guess} of 40. Tappers predicted 20 of 40. Listeners got 1 of 40.`}>
            {rows.map(([l, v, pencil]) => (
              <div key={l} className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)] items-center gap-3 text-sm">
                <span className={cn(pencil && "font-semibold")}>{l}</span>
                <div className="relative h-7 overflow-hidden rounded-[3px] bg-border/60">
                  <div
                    className={cn("h-full rounded-[3px] animate-in slide-in-from-left duration-700", pencil ? "bg-pencil" : "bg-foreground/80")}
                    style={{ width: `${Math.max(1, v * 100)}%` }}
                  />
                  <span className="absolute inset-y-0 right-2 flex items-center font-mono text-xs font-medium tnum">{Math.round(v * 40)} of 40</span>
                </div>
              </div>
            ))}
          </div>
        )}
        <p role="status" className="text-sm text-muted-foreground">
          {revealed
            ? "Newton’s 1990 study: tappers expected about half the songs to be named. Listeners named 3 of 120, about 2.5%."
            : msg}
        </p>
      </LabFrame>
      <LabFrame code="Lab 09.B" title="Restate before you reply">
        <div className="grid gap-6">
          {RESTATE.map((q, i) => (
            <Restate key={i} q={q} />
          ))}
        </div>
      </LabFrame>
    </div>
  )
}

function Restate({ q }: { q: (typeof RESTATE)[number] }) {
  const [p, setP] = React.useState<number | null>(null)
  return (
    <div className="grid gap-2">
      <p className="text-[15px]">
        <span className="label-mono mr-2">They say</span>
        <span className="font-semibold">{q.s}</span>
      </p>
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
              "flex min-h-11 items-start gap-3 rounded-md border border-border bg-card px-4 py-2.5 text-left text-[15px] transition-colors",
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
      {p != null && <p role="status" className="text-sm text-muted-foreground">Rogers: say back what they said, to their satisfaction, before adding anything of your own.</p>}
    </div>
  )
}

/* S10 · Motivating potential and expectancy */
export function MotivationLab() {
  const { lab, setLab } = useProgress()
  const j = lab<number[]>("jcm", [4, 4, 4, 4, 4])
  const e = lab<number[]>("ex", [0.8, 0.6, 0.7])
  const mps = ((j[0] + j[1] + j[2]) / 3) * j[3] * j[4]
  const w = j.indexOf(Math.min(...j))
  const L = ["skill variety", "task identity", "task significance", "autonomy", "feedback"]
  const prod = e[0] * e[1] * e[2]
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <LabFrame code="Lab 10.A" title="Score a job you know: motivating potential">
        {JCM_LABELS.map((l, i) => (
          <RangeField key={l} id={`jcm-${i}`} label={l} value={j[i]} min={1} max={7} onChange={(v) => setLab("jcm", j.map((x, k) => (k === i ? v : x)))} />
        ))}
        <div className="grid gap-2">
          <p className="font-mono text-5xl leading-none font-medium tracking-tight tnum">
            {Math.round(mps)}
            <span className="ml-2 font-sans text-base font-medium text-muted-foreground">MPS of 343</span>
          </p>
          <div className="h-2 overflow-hidden rounded-full bg-border">
            <div className="h-full rounded-full bg-foreground transition-[width] duration-500" style={{ width: `${(mps / 343) * 100}%` }} />
          </div>
        </div>
        <Readout>
          Weakest lever: {L[w]}. {w >= 3 ? "It multiplies the whole score, so fixing it pays most." : "Raising it helps, but autonomy and feedback multiply the total."}
        </Readout>
        <p className="text-xs text-muted-foreground">MPS = ((variety + identity + significance) / 3) x autonomy x feedback. Range 1 to 343.</p>
      </LabFrame>
      <LabFrame code="Lab 10.B" title="Expectancy: one zero sinks it">
        {EXPECTANCY_LABELS.map((l, i) => (
          <RangeField
            key={l}
            id={`ex-${i}`}
            label={l}
            value={e[i]}
            min={0}
            max={1}
            step={0.1}
            format={(v) => v.toFixed(1)}
            onChange={(v) => setLab("ex", e.map((x, k) => (k === i ? v : x)))}
          />
        ))}
        <p className={cn("font-mono text-5xl leading-none font-medium tracking-tight tnum", prod === 0 && "text-pencil")}>
          {prod.toFixed(2)}
          <span className="ml-2 font-sans text-base font-medium text-muted-foreground">motivation</span>
        </p>
        <p className="text-sm text-muted-foreground">Slide any one to zero and watch the total.</p>
      </LabFrame>
    </div>
  )
}

/* S11 · Ladder of inference and fixing feedback */
export function LadderLab() {
  const { lab, setLab } = useProgress()
  const k = lab<"tough" | "soft">("ld", "tough")
  const fi = lab<number>("fx", 0)
  const st = LADDER_PATHS[k]
  const rungs = fwById("ladder")!.rows
  const txt = [st[4], st[3], st[2], st[1], st[0], "Everything the manager said, word for word"]
  const c = FEEDBACK_CASES[fi]
  const flaws = fwById("five-flaws")!.rows
  return (
    <div className="grid gap-6">
      <LabFrame code="Lab 11.A" title="Climb the ladder of inference with Ellen" note="Same data, opposite conclusions. From Cannon and Witherspoon, Figure 3.">
        <p className="text-[15px] text-muted-foreground">
          Ellen’s manager says: Performance appraisals aren’t easy. Giving honest feedback as a part of performance appraisal is really important. Of course, you still have to be somewhat diplomatic with people nowadays.
        </p>
        <Segmented
          label="Which data Ellen selects"
          value={k}
          onChange={(v) => setLab("ld", v)}
          options={[
            { value: "tough", label: "She hears “honest”" },
            { value: "soft", label: "She hears “diplomatic”" },
          ]}
        />
        <ol aria-label="Ladder of inference, top rung first" className="grid border-l-2 border-foreground">
          {rungs.map((r, i) => (
            <li
              key={`${k}-${i}`}
              className={cn(
                "grid gap-1 border-b border-border px-4 py-3 animate-in fade-in slide-in-from-left-1 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-4",
                i === 5 && "border-b-0 bg-muted"
              )}
              style={{ animationDelay: `${(5 - i) * 70}ms`, animationFillMode: "both" }}
            >
              <span className="label-mono pt-0.5">{r[0].replace(/^\d+ /, "")}</span>
              <span className={cn("text-[15px]", i === 0 && "font-semibold text-pencil")}>{txt[i]}</span>
            </li>
          ))}
        </ol>
      </LabFrame>
      <LabFrame code="Lab 11.B" title="Fix the feedback">
        <Segmented
          label="Pick a statement"
          value={String(fi)}
          onChange={(v) => setLab("fx", Number(v))}
          options={FEEDBACK_CASES.map((x, i) => ({ value: String(i), label: x.who }))}
        />
        <p className="text-2xl leading-tight font-semibold tracking-tight">“{c.s}”</p>
        <ul className="grid gap-1.5">
          {flaws.map((f, i) => {
            const has = c.flaws.includes(i)
            return (
              <li key={i} className="flex items-start gap-3 text-[15px]">
                <span className={cn("mt-0.5 inline-flex min-w-14 justify-center rounded-[3px] border px-2 py-0.5 font-mono text-[11px] font-medium uppercase", has ? "border-foreground" : "border-ok text-ok")}>
                  {has ? "Flaw" : "OK"}
                </span>
                <span>
                  <b className="font-semibold">{f[0]}.</b> <span className="text-muted-foreground">{f[1]}</span>
                </span>
              </li>
            )
          })}
        </ul>
        <Readout>
          <p className="label-mono mb-1">After walking down the ladder</p>
          {c.fix}
        </Readout>
      </LabFrame>
    </div>
  )
}

/* S12 · Energy check */
export function EnergyLab() {
  const { lab, setLab } = useProgress()
  const en = lab<Record<number, boolean>>("en", {})
  const dims = ["Physical", "Emotional", "Mental", "Spirit"]
  const sc: Record<string, number> = { Physical: 2, Emotional: 2, Mental: 2, Spirit: 2 }
  ENERGY_ITEMS.forEach((it, i) => {
    if (en[i]) sc[it[0]]--
  })
  const lo = [...dims].sort((a, b) => sc[a] - sc[b])[0]
  return (
    <LabFrame code="Lab 12.A" title="Quick energy check">
      <p className="text-sm text-muted-foreground">Tick what is true for you. Adapted for this page; the article has its own fuller audit.</p>
      <div className="grid sm:grid-cols-2 sm:gap-x-6">
        {ENERGY_ITEMS.map((it, i) => (
          <CheckRow key={i} id={`en-${i}`} checked={!!en[i]} onChange={(v) => setLab("en", { ...en, [i]: v })}>
            <span className="label-mono mr-1.5">{it[0]}</span> {it[1]}
          </CheckRow>
        ))}
      </div>
      <div className="grid gap-2.5">
        {dims.map((d) => (
          <Meter key={d} label={d} value={sc[d]} max={2} />
        ))}
      </div>
      <Readout>{sc[lo] === 2 ? "All four look full. Check again after a hard week." : `Lowest: ${lo}. Try this: ${ENERGY_TIPS[lo]}`}</Readout>
    </LabFrame>
  )
}
