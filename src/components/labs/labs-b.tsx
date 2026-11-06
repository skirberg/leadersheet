"use client"

import * as React from "react"
import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Num } from "@/components/motion/number"
import { CheckRow, LabFrame, Meter, RangeField, Readout, Segmented, Sorter } from "./kit"
import { useProgress, useReducedMotion } from "@/lib/store"
import { fwById } from "@/data/course"
import { CONFLICT_TYPE_ITEMS, HOT_COOL_ITEMS, TKI_MODES } from "@/data/labs"

/* S05 · Kotter's staircase and Conger's checklist */
export function KotterLab() {
  const rows = fwById("kotter-8")!.rows
  const conger = fwById("conger-4")!.rows
  const [sel, setSel] = React.useState<number | null>(null)
  const [cg, setCg] = React.useState<Record<number, boolean>>({})
  const rm = useReducedMotion()
  const timer = React.useRef<ReturnType<typeof setInterval> | null>(null)
  React.useEffect(() => () => {
    if (timer.current) clearInterval(timer.current)
  }, [])
  const play = () => {
    if (timer.current) clearInterval(timer.current)
    if (rm) return setSel(7)
    let i = 0
    setSel(0)
    timer.current = setInterval(() => {
      i++
      setSel(i)
      if (i >= 7 && timer.current) clearInterval(timer.current)
    }, 650)
  }
  return (
    <div className="grid gap-6">
      <LabFrame code="Lab 05.A" title="Climb the eight steps. Tap a step to see what breaks without it.">
        <svg className="viz max-w-[640px]" viewBox="0 0 600 272" role="group" aria-label="Kotter's eight steps as a staircase. Each step is a button.">
          {rows.map((_, i) => {
            const x = 20 + i * 70,
              y = 232 - i * 26
            const on = sel != null && i <= sel,
              cur = i === sel
            return (
              <g
                key={i}
                role="button"
                tabIndex={0}
                aria-pressed={cur}
                aria-label={`Step ${i + 1}: ${rows[i][0].replace(/^\d+ /, "")}`}
                onClick={() => setSel(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    setSel(i)
                  }
                }}
              >
                <rect
                  x={x}
                  y={y}
                  width={66}
                  height={252 - y}
                  rx={3}
                  className={cur ? "fill-signal" : on ? "fill-ink" : "fill-soft"}
                  style={{ transition: "fill 300ms" }}
                />
                <rect x={x} y={y} width={66} height={252 - y} rx={3} fill="none" className="focus-ring" />
                <text x={x + 33} y={y - 8} textAnchor="middle" className="lbl">
                  {i + 1}
                </text>
              </g>
            )
          })}
          <line x1={10} x2={590} y1={252.5} y2={252.5} className="edge-ink" />
        </svg>
        <Readout>
          {sel != null ? (
            <>
              <b className="font-semibold">{rows[sel][0]}.</b> {rows[sel][1]}.
            </>
          ) : (
            "Tap a step, or play the climb."
          )}
        </Readout>
        <div>
          <Button variant="outline" onClick={play}>
            <Play className="size-4" /> Play the climb
          </Button>
        </div>
      </LabFrame>
      <LabFrame code="Lab 05.B" title="Before you try to persuade someone">
        <div>
          {conger.map((x, i) => (
            <CheckRow key={i} id={`cg4-${i}`} checked={!!cg[i]} onChange={(v) => setCg((s) => ({ ...s, [i]: v }))}>
              <b className="font-semibold">{x[0]}.</b> <span className="text-muted-foreground">{x[1]}</span>
            </CheckRow>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">Conger: most people skip straight to evidence. The first two steps decide whether anyone listens.</p>
      </LabFrame>
    </div>
  )
}

/* S06 · The working sheet: guess first, watch the team grow, then redesign it */
const TAKES = [
  { value: "2", label: "About twice" },
  { value: "3", label: "About three times" },
  { value: "6", label: "About six times" },
  { value: "?", label: "Not sure" },
] as const
type Take = (typeof TAKES)[number]["value"]
const pairs = (n: number) => (n * (n - 1)) / 2
/** Conversations to keep up when a team of n splits into pods of k, and only the pod leads talk across. */
function podLinks(n: number, k: number) {
  if (k >= n) return pairs(n)
  const pods = Math.ceil(n / k)
  let inside = 0
  for (let p = 0; p < pods; p++) inside += pairs(Math.min(k, n - p * k))
  return inside + pairs(pods)
}

function TeamNet({ n, pod }: { n: number; pod: number }) {
  const R = 120
  const k = Math.min(pod, n)
  const pods = Math.ceil(n / k)
  // Seats around a ring, with a gap between pods so the groups read at a glance.
  const gap = pods > 1 ? 0.9 : 0
  const step = (2 * Math.PI) / (n + gap * pods)
  const pts = Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + (i + gap * Math.floor(i / k)) * step
    return [Math.cos(a) * R, Math.sin(a) * R] as const
  })
  const podOf = (i: number) => Math.floor(i / k)
  const isLead = (i: number) => i % k === 0
  const lines: React.ReactNode[] = []
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) {
      const same = podOf(i) === podOf(j)
      if (!same && !(isLead(i) && isLead(j))) continue
      lines.push(<line key={`${i}-${j}`} x1={pts[i][0]} y1={pts[i][1]} x2={pts[j][0]} y2={pts[j][1]} className={same || pods === 1 ? "edge" : "edge-signal"} strokeWidth={same || pods === 1 ? 1 : 1.75} />)
    }
  return (
    <svg className="viz mx-auto w-full max-w-[340px]" viewBox="-150 -150 300 300" role="img" aria-label={`${n} people, ${pods > 1 ? `${pods} pods, ` : ""}${pods > 1 ? podLinks(n, k) : pairs(n)} conversations to keep up`}>
      {lines}
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={8} className={pods > 1 && isLead(i) ? "node node-lead" : "node"} />
      ))}
    </svg>
  )
}

export function TeamLab() {
  const { lab, setLab } = useProgress()
  const rm = useReducedMotion()
  const take = lab<Take | "">("tw-take", "")
  const helped = lab<boolean>("tw-help", false)
  const n = lab<number>("tn", 6)
  const pod = lab<number>("tw-pod", 15)
  const [grow, setGrow] = React.useState<number | null>(null)

  // After your take, the team grows from 6 to 14 in front of you, one person at a time.
  const answer = (v: Take) => {
    setLab("tw-take", v)
    setLab("tw-pod", 15)
    if (rm) {
      setLab("tn", 14)
      return
    }
    let k = 6
    setGrow(6)
    const t = window.setInterval(() => {
      k += 1
      setGrow(k)
      if (k >= 14) {
        window.clearInterval(t)
        setGrow(null)
        setLab("tn", 14)
      }
    }, 140)
  }
  const shown = grow ?? (take ? n : 6)
  const links = pod < shown ? podLinks(shown, pod) : pairs(shown)
  const verdict =
    take === "6"
      ? "Right. Six times, not twice: 15 conversations become 91."
      : take === "?"
        ? "15 conversations become 91. Six times as many, for a bit more than twice the people."
        : take
          ? `It's six times, not ${take === "2" ? "twice" : "three times"}: 15 conversations become 91, for a bit more than twice the people.`
          : ""

  return (
    <div className="grid gap-6">
      <LabFrame code="Lab 06.A" title="Your team of 6 works. Next month it becomes 14.">
        <div className="grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <TeamNet n={shown} pod={take && !grow ? pod : 15} />
          <div className="grid content-start gap-4">
            {!take ? (
              <>
                <p className="text-lg leading-snug font-semibold text-balance">
                  Everyone still has to stay in sync with everyone else. How many more conversations does that take?
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {TAKES.map((t) => (
                    <Button key={t.value} type="button" variant="outline" className="h-auto min-h-12 justify-start px-3 py-2 text-left text-[15px] whitespace-normal" onClick={() => answer(t.value)}>
                      {t.label}
                    </Button>
                  ))}
                </div>
                {helped ? (
                  <p className="text-[15px] text-muted-foreground">Hint: count the pairs. With 3 people there are 3 pairs; with 4 there are 6; with 5 there are 10.</p>
                ) : (
                  <button type="button" onClick={() => setLab("tw-help", true)} className="justify-self-start text-[15px] text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground">
                    Show a hint
                  </button>
                )}
              </>
            ) : (
              <>
                <p className="font-mono text-6xl leading-none font-medium tracking-tight tnum">
                  <Num value={links} />
                  <span className="ml-2 font-sans text-base font-medium text-muted-foreground">conversations, {shown} people</span>
                </p>
                {!grow && n === 14 && pod >= n && <p className="text-lg leading-snug font-semibold text-balance">{verdict}</p>}
              </>
            )}
          </div>
        </div>

        {take && !grow && (
          <>
            <dl className="grid gap-3 border-t border-border pt-4 text-[15px] sm:grid-cols-3 sm:gap-5">
              <div className="grid content-start gap-1">
                <dt className="label-mono">Math</dt>
                <dd>Every pair is a conversation: n people make n(n−1)/2 pairs. Add one person and you add a conversation with everyone already there.</dd>
              </div>
              <div className="grid content-start gap-1">
                <dt className="label-mono">Research claim</dt>
                <dd>
                  Hackman: managing those links is what gets teams into trouble. His rule of thumb: &ldquo;no double digits.&rdquo;{" "}
                  <a className="underline decoration-border underline-offset-4 hover:decoration-foreground" href="https://hbr.org/2009/05/why-teams-dont-work" target="_blank" rel="noreferrer">
                    HBR, 2009
                  </a>
                </dd>
              </div>
              <div className="grid content-start gap-1">
                <dt className="label-mono">Where it stops</dt>
                <dd>These are possible conversations, not real ones. Teams that split up only need some of them, and that has a cost of its own.</dd>
              </div>
            </dl>

            <div className="grid gap-4 border-t border-border pt-4">
              <p className="text-lg leading-snug font-semibold">Now you design it. Split the team and watch what it costs.</p>
              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                <RangeField id="tm-n" label="People" value={n} min={3} max={15} onChange={(v) => setLab("tn", v)} />
                <Segmented
                  label="How the team is organized"
                  value={String(pod)}
                  onChange={(v) => setLab("tw-pod", Number(v))}
                  options={[
                    { value: "15", label: "One team" },
                    { value: "5", label: "Pods of 5" },
                    { value: "3", label: "Pods of 3" },
                  ]}
                />
              </div>
              <Readout>
                {pod >= n
                  ? `One team of ${n}: ${pairs(n)} conversations, and everyone hears everything.`
                  : `Pods: ${podLinks(n, pod)} conversations instead of ${pairs(n)}. The cost: anything that crosses pods now goes through the leads, shown in color, and they become the bottleneck.`}
              </Readout>
              <button
                type="button"
                onClick={() => {
                  setLab("tw-take", "")
                  setLab("tn", 6)
                  setLab("tw-pod", 15)
                }}
                className="justify-self-start text-[15px] text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground"
              >
                Start over
              </button>
            </div>
          </>
        )}
      </LabFrame>
      <LabFrame code="Lab 06.B" title="Three kinds of conflict: sort them">
        <Sorter
          items={CONFLICT_TYPE_ITEMS}
          buckets={[
            { key: "T", label: "Task" },
            { key: "R", label: "Relationship" },
            { key: "P", label: "Process" },
          ]}
          hint="Task conflict can help when trust is high and it stays about ideas. The other two usually hurt."
        />
      </LabFrame>
    </div>
  )
}

/* S07 · Hot or cool, and the five conflict modes */
export function ConflictLab() {
  const [sel, setSel] = React.useState<string | null>(null)
  return (
    <div className="grid gap-6">
      <LabFrame code="Lab 07.A" title="Hot or cool? Sort six disagreements.">
        <Sorter
          items={HOT_COOL_ITEMS}
          buckets={[
            { key: "C", label: "Cool" },
            { key: "H", label: "Hot" },
          ]}
          hint="Cool ones end with data. Hot ones touch identity, values or interests."
        />
      </LabFrame>
      <LabFrame code="Lab 07.B" title="Five ways people handle conflict" note="Thomas and Kilmann. Outside the assigned reading, useful for the lab.">
        <svg className="viz max-w-[620px]" viewBox="0 0 600 344" role="group" aria-label="Five conflict modes on two axes, assertiveness and cooperativeness. Each mode is a button.">
          <line className="grid-line" x1={60} y1={300} x2={580} y2={300} />
          <line className="grid-line" x1={60} y1={20} x2={60} y2={300} />
          <text x={320} y={330} textAnchor="middle">COOPERATIVENESS →</text>
          <text x={22} y={160} textAnchor="middle" transform="rotate(-90 22 160)">ASSERTIVENESS →</text>
          {Object.entries(TKI_MODES).map(([k, p]) => {
            const x = 60 + p[1] * 500,
              y = 300 - p[0] * 270,
              on = k === sel
            return (
              <g
                key={k}
                role="button"
                tabIndex={0}
                aria-pressed={on}
                aria-label={k}
                onClick={() => setSel(k)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    setSel(k)
                  }
                }}
              >
                <circle cx={x} cy={y} r={24} fill="transparent" className="focus-ring" />
                <circle cx={x} cy={y} r={on ? 11 : 8} className={on ? "fill-signal" : "node"} />
                <text x={x} y={y - 18} textAnchor="middle" className="lbl">{k}</text>
              </g>
            )
          })}
        </svg>
        <Readout>
          {sel ? (
            <>
              <b className="font-semibold">{sel}.</b> {TKI_MODES[sel][2]}
            </>
          ) : (
            "Tap a mode."
          )}
        </Readout>
      </LabFrame>
    </div>
  )
}

/* S08 · Twelve questions */
export function DecisionLab() {
  const { lab, setLab } = useProgress()
  const r = fwById("k12")!.rows
  const k12 = lab<Record<number, boolean>>("k12", {})
  const name = lab<string>("k12n", "")
  const n = r.filter((_, i) => k12[i]).length
  const groups: [string, number, number][] = [
    ["About the team", 0, 3],
    ["About the proposal", 3, 9],
    ["About the assessment", 9, 12],
  ]
  return (
    <LabFrame code="Lab 08.A" title="Run a real decision through the twelve questions">
      <div className="grid gap-1.5">
        <label htmlFor="k12-name" className="text-sm text-muted-foreground">The decision</label>
        <Input id="k12-name" className="h-11 text-base" placeholder="For example, which offer to take" value={name} onChange={(e) => setLab("k12n", e.target.value)} />
      </div>
      {groups.map(([g, a, b]) => (
        <div key={g}>
          <p className="label-mono mb-1">{g}</p>
          {r.slice(a, b).map((x, i) => {
            const j = a + i
            return (
              <CheckRow key={j} id={`k12-${j}`} checked={!!k12[j]} onChange={(v) => setLab("k12", { ...k12, [j]: v })}>
                <b className="font-semibold">{x[0]}.</b> {x[1]} <span className="text-muted-foreground">Tick if the answer worries you.</span>
              </CheckRow>
            )
          })}
        </div>
      ))}
      <Meter label="Flags raised" value={n} max={12} suffix={String(n)} />
      <Readout>
        {n === 0
          ? "No flags yet. Be honest with yourself; the point is to find one."
          : n < 3
            ? "A few flags. Get the missing information before deciding."
            : "Several flags. The authors would send this back for more work, or add a dissenter."}
      </Readout>
    </LabFrame>
  )
}
