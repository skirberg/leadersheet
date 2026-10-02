"use client"

import * as React from "react"
import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckRow, LabFrame, Meter, RangeField, Readout, Sorter } from "./kit"
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
                  className={cur ? "fill-pencil" : on ? "fill-ink" : "fill-soft"}
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

/* S06 · Team links and conflict types */
export function TeamLab() {
  const { lab, setLab } = useProgress()
  const n = lab<number>("tn", 6)
  const R = 120
  const pts = Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n
    return [Math.cos(a) * R, Math.sin(a) * R]
  })
  const links = (n * (n - 1)) / 2
  return (
    <div className="grid gap-6">
      <LabFrame code="Lab 06.A" title="Every person you add multiplies the conversations">
        <div className="grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
          <svg className="viz max-w-[360px]" viewBox="-160 -150 320 300" role="img" aria-label={`A team of ${n} people with ${links} communication links`}>
            {pts.map((p, i) =>
              pts.slice(i + 1).map((q, j) => {
                const newest = i + 1 + j === n - 1
                return <line key={`${i}-${j}`} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} className={newest ? "edge-pencil" : "edge"} strokeWidth={newest ? 1.75 : 1} />
              })
            )}
            {pts.map((p, i) => (
              <circle key={i} cx={p[0]} cy={p[1]} r={9} className={i === n - 1 ? "node node-lead" : "node"} />
            ))}
          </svg>
          <div className="grid gap-4">
            <RangeField id="tm-n" label="Team size" value={n} min={2} max={15} onChange={(v) => setLab("tn", v)} />
            <p className="font-mono text-5xl leading-none font-medium tracking-tight tnum">
              {links}
              <span className="ml-2 font-sans text-base font-medium text-muted-foreground">links</span>
            </p>
            <p className="text-sm text-muted-foreground">{n > 2 ? `The newest person, in red pencil, adds ${n - 1}.` : "Two people, one conversation."}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Links = n(n-1)/2. Hackman argued most teams are too big; past about six to eight, coordination eats the gains.
        </p>
      </LabFrame>
      <LabFrame code="Lab 06.B" title="Three kinds of conflict: sort them">
        <Sorter
          items={CONFLICT_TYPE_ITEMS}
          buckets={[
            { key: "T", label: "Task" },
            { key: "R", label: "Relationship" },
            { key: "P", label: "Process" },
          ]}
          hint="Task conflict, kept to ideas, often helps. The other two usually hurt."
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
                <circle cx={x} cy={y} r={on ? 11 : 8} className={on ? "fill-pencil" : "node"} />
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
                <b className="font-semibold">{x[0]}.</b> {x[1]} <span className="text-muted-foreground">Tick if this is a concern.</span>
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
