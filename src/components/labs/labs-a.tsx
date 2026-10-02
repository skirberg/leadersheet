"use client"

import * as React from "react"
import { CheckRow, LabFrame, Meter, RangeField, Readout, Segmented, Sorter } from "./kit"
import { useProgress } from "@/lib/store"
import { fwById } from "@/data/course"
import {
  CONGRUENCE_PAIRS,
  CULTURE_STYLES,
  EI_DIMS,
  MANAGE_ITEMS,
  STRUCTURE_BARS,
  STRUCTURES,
  type StructureKind,
} from "@/data/labs"
import { cn } from "@/lib/utils"

/* S01 · Management or leadership */
export function ManageLab() {
  return (
    <LabFrame code="Lab 01.A" title="Management or leadership? Sort six tasks.">
      <Sorter
        items={MANAGE_ITEMS}
        buckets={[
          { key: "M", label: "Management" },
          { key: "L", label: "Leadership" },
        ]}
        hint="Kotter: management copes with complexity, leadership copes with change."
      />
    </LabFrame>
  )
}

/* S02 · Emotional intelligence radar */
export function EiLab() {
  const { lab, setLab } = useProgress()
  const me = lab<number[]>("ei", [3, 3, 3, 3, 3])
  const ot = lab<number[]>("ei2", [3, 3, 3, 3, 3])
  const R = 110,
    n = 5
  const pt = (i: number, v: number) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n
    return [Math.cos(a) * (R * v) / 5, Math.sin(a) * (R * v) / 5]
  }
  const poly = (vals: number[]) => vals.map((v, i) => pt(i, v).join(",")).join(" ")
  const gaps = EI_DIMS.map((d, i) => [d, me[i] - ot[i]] as const).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
  const set = (k: "ei" | "ei2", arr: number[], i: number, v: number) => {
    const next = [...arr]
    next[i] = v
    setLab(k, next)
  }
  return (
    <LabFrame code="Lab 02.A" title="Rate yourself, then rate how a colleague would see you">
      <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <figure className="grid gap-3">
          <svg className="viz max-w-[420px]" viewBox="-225 -150 450 300" role="img" aria-label="Radar chart of the five emotional intelligence components, you against a colleague">
            {[1, 2, 3, 4, 5].map((r) => (
              <polygon key={r} className="grid-line" points={poly([r, r, r, r, r])} />
            ))}
            {EI_DIMS.map((d, i) => {
              const p = pt(i, 5),
                l = pt(i, 6.1)
              return (
                <g key={d}>
                  <line className="grid-line" x1={0} y1={0} x2={p[0]} y2={p[1]} />
                  <text
                    x={l[0]}
                    y={l[1] + 4}
                    className="lbl"
                    textAnchor={Math.abs(l[0]) < 5 ? "middle" : l[0] > 0 ? "start" : "end"}
                  >
                    {d}
                  </text>
                </g>
              )
            })}
            <polygon points={poly(ot)} fill="none" stroke="var(--muted-foreground)" strokeWidth={1.75} strokeDasharray="5 4" className="transition-all duration-300" />
            <polygon points={poly(me)} fill="var(--signal-soft)" stroke="var(--signal)" strokeWidth={2.25} className="transition-all duration-300" />
          </svg>
          <figcaption className="flex flex-wrap justify-center gap-5 text-sm">
            <span className="inline-flex items-center gap-2"><i className="block h-[3px] w-6 bg-signal" /> You</span>
            <span className="inline-flex items-center gap-2"><i className="block h-0 w-6 border-t-2 border-dashed border-muted-foreground" /> A colleague</span>
          </figcaption>
        </figure>
        <div className="grid gap-6 sm:grid-cols-2">
          {([["You", "ei", me], ["A colleague", "ei2", ot]] as const).map(([who, k, arr]) => (
            <div key={k} className="grid gap-2">
              <p className="label-mono">{who}</p>
              {EI_DIMS.map((d, i) => (
                <RangeField key={d} id={`${k}-${i}`} label={d} ariaLabel={`${who}: ${d}`} value={arr[i]} min={1} max={5} onChange={(v) => set(k, arr, i, v)} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <Readout>
        {gaps[0][1] === 0
          ? "No gap yet. Ask a real colleague to rate you, then move the dashed line."
          : `Biggest gap: ${gaps[0][0]} (${gaps[0][1] > 0 ? "you rate yourself higher" : "they rate you higher"}). Goleman starts with self-awareness for this reason.`}
      </Readout>
    </LabFrame>
  )
}

/* S03 · Structure morph, congruence model, nine tests */
const LAYOUT: Record<StructureKind, { ceo: number[]; a: number[][]; b: number[][]; al: string[] }> = {
  functional: { ceo: [300, 34], a: [[120, 110], [300, 110], [480, 110]], b: [[80, 196], [160, 196], [260, 196], [340, 196], [440, 196], [520, 196]], al: ["Sales", "Product", "Finance"] },
  divisional: { ceo: [300, 34], a: [[120, 110], [300, 110], [480, 110]], b: [[80, 196], [160, 196], [260, 196], [340, 196], [440, 196], [520, 196]], al: ["Wearables", "Audio", "Services"] },
  matrix: { ceo: [300, 34], a: [[150, 110], [300, 110], [450, 110]], b: [[150, 190], [300, 190], [450, 190], [150, 236], [300, 236], [450, 236]], al: ["Sales", "Product", "Finance"] },
  flat: { ceo: [300, 130], a: [[160, 60], [440, 60], [300, 222]], b: [[96, 150], [200, 214], [400, 214], [504, 150], [226, 118], [374, 118]], al: ["Team A", "Team B", "Team C"] },
}

function StructureMorph() {
  const { lab, setLab } = useProgress()
  const k = lab<StructureKind>("st", "functional")
  const K = STRUCTURES[k],
    P = LAYOUT[k]
  const tr = (p: number[]) => ({ transform: `translate(${p[0]}px, ${p[1]}px)` })
  let edges: React.ReactNode
  if (k === "matrix") {
    edges = (
      <>
        {P.a.map((a, i) => (
          <path key={i} className="edge" d={`M300 50 L${a[0]} ${a[1] - 16} M${a[0]} ${a[1] + 16} L${a[0]} 224`} />
        ))}
        {[190, 236].map((y, ri) => (
          <g key={y}>
            <path className="edge-signal" strokeDasharray="5 5" strokeWidth={1.75} d={`M92 ${y} L476 ${y}`} />
            <text x={22} y={y + 4} className="lbl">{ri ? "Audio" : "Wearables"}</text>
          </g>
        ))}
      </>
    )
  } else if (k === "flat") {
    edges = (
      <>
        {P.b.map((b, i) => {
          const a = P.a[i % 3]
          return <path key={i} className="edge" d={`M${a[0]} ${a[1]} L${b[0]} ${b[1]}`} />
        })}
        {P.a.map((a, i) => (
          <path key={`c${i}`} className="edge-ink" d={`M300 130 L${a[0]} ${a[1]}`} />
        ))}
        <path className="edge" strokeDasharray="4 4" d="M160 60 L440 60 L300 222 Z" />
      </>
    )
  } else {
    edges = P.a.map((a, i) => (
      <g key={i}>
        <path className="edge-ink" d={`M300 50 C300 84 ${a[0]} 74 ${a[0]} ${a[1] - 16}`} />
        {[P.b[i * 2], P.b[i * 2 + 1]].map((b, j) => (
          <path key={j} className="edge" d={`M${a[0]} ${a[1] + 16} C${a[0]} 156 ${b[0]} 156 ${b[0]} ${b[1] - 12}`} />
        ))}
      </g>
    ))
  }
  return (
    <LabFrame code="Lab 03.A" title="Four structures, one company" note="Bars are an illustrative comparison to support discussion, not measured data.">
      <Segmented
        label="Structure"
        value={k}
        onChange={(v) => setLab("st", v)}
        options={(Object.keys(STRUCTURES) as StructureKind[]).map((x) => ({ value: x, label: STRUCTURES[x].name }))}
      />
      <svg className="viz max-w-[640px]" viewBox="0 0 600 260" role="img" aria-label={`Organization chart, ${K.name} structure`}>
        <g key={k} className="animate-in fade-in duration-500">{edges}</g>
        <g className="move" style={tr(P.ceo)}>
          <rect className="node node-lead" x={-48} y={-16} width={96} height={32} rx={4} />
          <text className="lbl" textAnchor="middle" y={5} style={{ fill: "var(--signal-foreground)" }}>Leader</text>
        </g>
        {P.a.map((p, i) => (
          <g key={i} className="move" style={tr(p)}>
            <rect className="node" x={-54} y={-16} width={108} height={32} rx={4} />
            <text className="lbl" textAnchor="middle" y={5}>{P.al[i]}</text>
          </g>
        ))}
        {P.b.map((p, j) => (
          <g key={j} className="move" style={tr(p)}>
            <circle className="node" r={11} />
          </g>
        ))}
      </svg>
      <p className="text-[15px]">{K.why}</p>
      <div className="grid gap-2.5">
        {STRUCTURE_BARS.map((l, i) => (
          <Meter key={l} label={l} value={K.score[i]} max={5} />
        ))}
      </div>
    </LabFrame>
  )
}

const CG_NODES: Record<string, [number, number, string]> = {
  work: [300, 66, "Work"],
  people: [150, 150, "People"],
  formal: [450, 150, "Formal org"],
  informal: [300, 234, "Informal org"],
}
function Congruence() {
  const [sel, setSel] = React.useState<number | null>(null)
  const p = sel != null ? CONGRUENCE_PAIRS[sel] : null
  return (
    <LabFrame code="Lab 03.B" title="Congruence model: tap a pair to test the fit" note="Fit questions from the Mercer Delta congruence model paper, Figure 5.">
      <svg className="viz max-w-[640px]" viewBox="0 0 600 300" role="group" aria-label="Congruence model. Each line between two parts is a button.">
        <text x={0} y={146} className="lbl">Inputs</text>
        <text x={0} y={162}>strategy</text>
        <text x={600} y={154} className="lbl" textAnchor="end">Output</text>
        {CONGRUENCE_PAIRS.map((pr, i) => {
          const a = CG_NODES[pr[0]],
            b = CG_NODES[pr[1]]
          const on = sel === i
          return (
            <g
              key={i}
              role="button"
              tabIndex={0}
              aria-pressed={on}
              aria-label={pr[2]}
              onClick={() => setSel(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  setSel(i)
                }
              }}
            >
              <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} className={on ? "edge-signal" : "edge"} strokeWidth={on ? 4 : 2} />
              <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="transparent" strokeWidth={24} className="focus-ring" />
            </g>
          )
        })}
        {Object.entries(CG_NODES).map(([k, n]) => (
          <g key={k}>
            <rect className="node" x={n[0] - 60} y={n[1] - 19} width={120} height={38} rx={19} />
            <text className="lbl" x={n[0]} y={n[1] + 5} textAnchor="middle">{n[2]}</text>
          </g>
        ))}
      </svg>
      <Readout>
        {p ? (
          <>
            <b className="font-semibold">{p[2]}.</b> {p[3]}
          </>
        ) : (
          "Tap any line between two parts."
        )}
      </Readout>
    </LabFrame>
  )
}

function NineTests() {
  const { lab, setLab } = useProgress()
  const nt = lab<Record<number, boolean>>("nt", {})
  const rows = fwById("nine-tests")!.rows
  const n = rows.filter((_, i) => nt[i]).length
  return (
    <LabFrame code="Lab 03.C" title="Run your own team through the nine tests">
      <div className="grid sm:grid-cols-2 sm:gap-x-6">
        {rows.map((r, i) => (
          <CheckRow key={i} id={`nt-${i}`} checked={!!nt[i]} onChange={(v) => setLab("nt", { ...nt, [i]: v })}>
            <b className="font-semibold">{r[0]}.</b> <span className="text-muted-foreground">{r[1]}</span>
          </CheckRow>
        ))}
      </div>
      <Meter label="Tests passed" value={n} max={9} />
      <p role="status" className="text-sm text-muted-foreground">
        {n < 9 ? "Each failed test is a design problem worth naming." : "A rare clean bill. Check it with someone who sees it differently."}
      </p>
    </LabFrame>
  )
}

export function StructureLab() {
  return (
    <div className="grid gap-6">
      <StructureMorph />
      <Congruence />
      <NineTests />
    </div>
  )
}

/* S04 · Culture map */
export function CultureLab() {
  const { lab, setLab } = useProgress()
  const sel = lab<string[]>("cu", [])
  const tog = (k: string) => {
    const a = [...sel]
    const i = a.indexOf(k)
    if (i >= 0) a.splice(i, 1)
    else {
      a.push(k)
      if (a.length > 2) a.shift()
    }
    setLab("cu", a)
  }
  const X = (v: number) => v * 240,
    Y = (v: number) => -v * 185
  let verdict = ""
  if (sel.length === 2) {
    const A = CULTURE_STYLES[sel[0]],
      B = CULTURE_STYLES[sel[1]]
    const dist = Math.hypot(A[0] - B[0], A[1] - B[1])
    verdict =
      dist < 0.8
        ? "These sit close together, so they tend to reinforce each other."
        : dist < 1.3
          ? "These are a moderate stretch. Expect some friction in how decisions get made."
          : "These sit far apart. Expect tension; people will feel pulled between them."
  }
  return (
    <LabFrame code="Lab 04.A" title="The culture map. Pick the two styles that describe your team." note="Positions are approximate, after the culture map in Groysberg et al., 2018.">
      <svg className="viz max-w-[600px]" viewBox="-300 -232 600 470" role="group" aria-label="Culture map with eight styles. Each style is a button.">
        <rect x={-260} y={-200} width={520} height={400} rx={4} className="grid-line" />
        <line className="grid-line" x1={0} y1={-200} x2={0} y2={200} />
        <line className="grid-line" x1={-260} y1={0} x2={260} y2={0} />
        <text x={0} y={-212} textAnchor="middle">FLEXIBILITY</text>
        <text x={0} y={222} textAnchor="middle">STABILITY</text>
        <text x={-250} y={-10}>INDEPENDENCE</text>
        <text x={250} y={-10} textAnchor="end">INTERDEPENDENCE</text>
        {sel.length === 2 && (
          <line
            className="edge-signal"
            x1={X(CULTURE_STYLES[sel[0]][0])}
            y1={Y(CULTURE_STYLES[sel[0]][1])}
            x2={X(CULTURE_STYLES[sel[1]][0])}
            y2={Y(CULTURE_STYLES[sel[1]][1])}
          />
        )}
        {Object.entries(CULTURE_STYLES).map(([k, p]) => {
          const on = sel.includes(k)
          return (
            <g
              key={k}
              role="button"
              tabIndex={0}
              aria-pressed={on}
              aria-label={k}
              onClick={() => tog(k)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  tog(k)
                }
              }}
            >
              <circle cx={X(p[0])} cy={Y(p[1])} r={22} fill="transparent" className="focus-ring" />
              <circle cx={X(p[0])} cy={Y(p[1])} r={on ? 10 : 7} className={on ? "fill-signal" : "node"} style={{ transition: "r 200ms" }} />
              <text x={X(p[0])} y={Y(p[1]) - 17} textAnchor="middle" className="lbl">{k}</text>
            </g>
          )
        })}
      </svg>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Culture styles">
        {Object.keys(CULTURE_STYLES).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={sel.includes(k)}
            onClick={() => tog(k)}
            className={cn(
              "min-h-10 rounded-full border border-border bg-card px-4 text-sm transition-colors hover:border-foreground/60",
              sel.includes(k) && "border-foreground bg-foreground font-semibold text-background hover:border-foreground"
            )}
          >
            {k}
          </button>
        ))}
      </div>
      <Readout>
        {sel.length === 0 ? (
          "Pick up to two."
        ) : (
          <div className="grid gap-1">
            {sel.map((k) => (
              <p key={k}>
                <b className="font-semibold">{k}:</b> {CULTURE_STYLES[k][2]}.
              </p>
            ))}
            {verdict && <p>{verdict}</p>}
          </div>
        )}
      </Readout>
    </LabFrame>
  )
}
