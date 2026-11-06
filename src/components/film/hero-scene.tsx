import type * as React from "react"
import { Easing, interpolate, spring } from "remotion"
import { STRUCTURE_BARS, STRUCTURES, type StructureKind } from "@/data/labs"

/*
  The home hero's drawing: the drafting table builds an organization and can draw it as any blend of the
  four structures from session 3. 1200 x 900 units; hero-live.tsx drives it from the visitor's hand.
*/

const KINDS: StructureKind[] = ["functional", "divisional", "matrix", "flat"]
const L: Record<StructureKind, { ceo: number[]; a: number[][]; b: number[][]; al: string[] }> = {
  functional: { ceo: [300, 34], a: [[120, 110], [300, 110], [480, 110]], b: [[80, 196], [160, 196], [260, 196], [340, 196], [440, 196], [520, 196]], al: ["Sales", "Product", "Finance"] },
  divisional: { ceo: [300, 34], a: [[130, 118], [300, 118], [470, 118]], b: [[90, 204], [170, 204], [260, 204], [340, 204], [430, 204], [510, 204]], al: ["Wearables", "Audio", "Services"] },
  matrix: { ceo: [300, 34], a: [[150, 110], [300, 110], [450, 110]], b: [[150, 190], [300, 190], [450, 190], [150, 236], [300, 236], [450, 236]], al: ["Sales", "Product", "Finance"] },
  flat: { ceo: [300, 132], a: [[160, 56], [440, 56], [300, 230]], b: [[96, 150], [200, 214], [400, 214], [504, 150], [226, 116], [374, 116]], al: ["Team A", "Team B", "Team C"] },
}
const S = 1.7,
  OX = 640 - 300 * S,
  OY = 230
const map = (p: number[]) => [p[0] * S + OX, p[1] * S + OY]
const ease = Easing.bezier(0.2, 0.7, 0.2, 1)
const mix = (w: number[], get: (k: StructureKind) => number[]) =>
  KINDS.reduce((acc, k, i) => [acc[0] + get(k)[0] * w[i], acc[1] + get(k)[1] * w[i]], [0, 0])

const mono = "var(--font-martian), ui-monospace, monospace"
const sans = "var(--font-funnel-display), system-ui, sans-serif"

/** Blend weights for a position t from 0 (functional) to 3 (flat), eased between neighbours. */
export function weightsAt(t: number) {
  const w = [0, 0, 0, 0]
  const i = Math.min(2, Math.floor(t))
  const u = ease(Math.min(1, Math.max(0, t - i)))
  w[i] = 1 - u
  w[i + 1] = u
  return w
}

export const HERO_KINDS = KINDS

/**
  The drawing itself, for any frame and any blend of the four structures.
  f is the build-in frame (30 per second; fully drawn from 100), w the weight of each structure.
*/
export function HeroScene({
  f,
  w,
  cap,
  out = 1,
  dimLabels = false,
  header = "SHEET S03 · LEADING THROUGH DESIGN",
  counter = true,
  plain = false,
  children,
}: {
  f: number
  w: number[]
  cap: number
  out?: number
  dimLabels?: boolean
  header?: string
  counter?: boolean
  /** The home hero: no graph paper, crop marks or monospace captions. */
  plain?: boolean
  children?: React.ReactNode
}) {
  const fps = 30
  const active = w.indexOf(Math.max(...w))
  const build = (delay: number) => spring({ frame: f - delay, fps, config: { damping: 14, stiffness: 140, mass: 0.6 } })
  const gridO = interpolate(f, [0, 18], [0, 1], { extrapolateRight: "clamp" })

  const ceo = map(mix(w, (k) => L[k].ceo))
  const as = [0, 1, 2].map((i) => map(mix(w, (k) => L[k].a[i])))
  const bs = [0, 1, 2, 3, 4, 5].map((i) => map(mix(w, (k) => L[k].b[i])))
  const draw = interpolate(f, [26, 70], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease })

  const tree = (o: number) =>
    o > 0.01 && (
      <g opacity={o}>
        {as.map((a, i) => (
          <g key={i}>
            <path d={`M${ceo[0]} ${ceo[1] + 27} C${ceo[0]} ${ceo[1] + 85} ${a[0]} ${a[1] - 70} ${a[0]} ${a[1] - 27}`} stroke="var(--foreground)" strokeWidth={2.5} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={draw} />
            {[bs[i * 2], bs[i * 2 + 1]].map((b, j) => (
              <path key={j} d={`M${a[0]} ${a[1] + 27} C${a[0]} ${a[1] + 75} ${b[0]} ${b[1] - 70} ${b[0]} ${b[1] - 19}`} stroke="var(--rule)" strokeWidth={2} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={draw} />
            ))}
          </g>
        ))}
      </g>
    )
  const matrix = (o: number) =>
    o > 0.01 && (
      <g opacity={o}>
        {as.map((a, i) => (
          <path key={i} d={`M${ceo[0]} ${ceo[1] + 27} L${a[0]} ${a[1] - 27} M${a[0]} ${a[1] + 27} L${a[0]} ${bs[3][1] + 30}`} stroke="var(--rule)" strokeWidth={2} fill="none" />
        ))}
        {[bs[0][1], bs[3][1]].map((y, ri) => (
          <g key={ri}>
            <path d={`M${bs[0][0] - 90} ${y} L${bs[2][0] + 40} ${y}`} stroke="var(--signal)" strokeWidth={2.5} strokeDasharray="9 9" fill="none" />
            <text x={bs[0][0] - 100} y={y + 8} textAnchor="end" style={{ font: `600 24px ${sans}`, fill: "var(--foreground)" }}>
              {ri ? "Audio" : "Wearables"}
            </text>
          </g>
        ))}
      </g>
    )
  const flat = (o: number) =>
    o > 0.01 && (
      <g opacity={o}>
        {bs.map((b, i) => (
          <path key={i} d={`M${as[i % 3][0]} ${as[i % 3][1]} L${b[0]} ${b[1]}`} stroke="var(--rule)" strokeWidth={2} />
        ))}
        {as.map((a, i) => (
          <path key={`c${i}`} d={`M${ceo[0]} ${ceo[1]} L${a[0]} ${a[1]}`} stroke="var(--foreground)" strokeWidth={2.5} />
        ))}
        <path d={`M${as[0][0]} ${as[0][1]} L${as[1][0]} ${as[1][1]} L${as[2][0]} ${as[2][1]} Z`} stroke="var(--rule)" strokeWidth={2} strokeDasharray="7 7" fill="none" />
      </g>
    )

  const K = STRUCTURES[KINDS[active]]
  const scores = [0, 1, 2, 3].map((i) => KINDS.reduce((acc, k, j) => acc + STRUCTURES[k].score[i] * w[j], 0))
  const loop = build(30) * out
  const leadR = 27

  return (
      <svg viewBox="0 0 1200 900" width="100%" height="100%" style={{ display: "block", background: "var(--card)" }}>
        <defs>
          <pattern id="hf-minor" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" fill="none" stroke="var(--grid)" strokeWidth="1" />
          </pattern>
          <pattern id="hf-major" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="url(#hf-minor)" />
            <path d="M100 0H0V100" fill="none" stroke="var(--grid)" strokeWidth="1.5" />
          </pattern>
        </defs>
        {!plain && <rect width="1200" height="900" fill="url(#hf-major)" opacity={gridO} />}

        {!plain && (
          <>
        {/* registration corners */}
        {[
          [60, 60, 1, 1],
          [1140, 60, -1, 1],
          [1140, 840, -1, -1],
          [60, 840, 1, -1],
        ].map(([x, y, dx, dy], i) => {
          const t = build(4 + i * 3)
          const off = (1 - t) * 40
          return (
            <path
              key={i}
              d={`M${x - dx * off} ${y - dy * off + dy * 34}V${y - dy * off}H${x - dx * off + dx * 34}`}
              stroke="var(--foreground)"
              strokeWidth={3}
              fill="none"
              opacity={Math.min(t, 1)}
            />
          )
        })}
        <text x={96} y={112} style={{ font: `500 19px ${mono}`, letterSpacing: "0.08em", fill: "var(--muted-foreground)" }} opacity={gridO}>
          {header}
        </text>
        <text x={1104} y={112} textAnchor="end" style={{ font: `500 19px ${mono}`, letterSpacing: "0.08em", fill: "var(--muted-foreground)" }} opacity={counter ? gridO : 0}>
          {String(active + 1).padStart(2, "0")} / 04
        </text>

          </>
        )}
        <g opacity={out}>
          {tree(w[0] + w[1])}
          {matrix(w[2])}
          {flat(w[3])}

          {/* team nodes */}
          {bs.map((b, i) => {
            const t = build(40 + i * 3)
            return <circle key={i} cx={b[0]} cy={b[1]} r={19 * t} fill="var(--card)" stroke="var(--foreground)" strokeWidth={2.5} />
          })}
          {/* managers */}
          {as.map((a, i) => {
            const t = build(30 + i * 4)
            const label = L[KINDS[active]].al[i]
            return (
              <g key={i} transform={`translate(${a[0]} ${a[1]}) scale(${t})`}>
                <rect x={-92} y={-27} width={184} height={54} rx={6} fill="var(--card)" stroke="var(--foreground)" strokeWidth={2.5} />
                <text y={9} textAnchor="middle" style={{ font: `600 25px ${sans}`, fill: "var(--foreground)" }} opacity={dimLabels ? 0.35 : 1}>
                  {label}
                </text>
              </g>
            )
          })}
          {/* the leader, in the signal color */}
          <g transform={`translate(${ceo[0]} ${ceo[1]}) scale(${build(18)})`}>
            <rect x={-82} y={-leadR} width={164} height={leadR * 2} rx={6} fill="var(--signal)" />
            <text y={9} textAnchor="middle" style={{ font: `600 25px ${sans}`, fill: "var(--signal-foreground)" }}>
              Leader
            </text>
          </g>
          <path
            d={`M${ceo[0] + 40} ${ceo[1] - 44}C${ceo[0] - 60} ${ceo[1] - 52} ${ceo[0] - 132} ${ceo[1] - 30} ${ceo[0] - 128} ${ceo[1] + 4}C${ceo[0] - 124} ${ceo[1] + 46} ${ceo[0] + 40} ${ceo[1] + 54} ${ceo[0] + 110} ${ceo[1] + 34}C${ceo[0] + 150} ${ceo[1] + 20} ${ceo[0] + 140} ${ceo[1] - 34} ${ceo[0] + 20} ${ceo[1] - 46}`}
            stroke="var(--signal)"
            strokeWidth={3.5}
            fill="none"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={interpolate(f, [52, 84], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease })}
            opacity={loop}
          />
        </g>

        {/* caption: the structure and its trade */}
        <g opacity={cap} transform={`translate(0 ${(1 - cap) * 14})`}>
          {!plain && (
            <text x={96} y={738} style={{ font: `500 18px ${mono}`, letterSpacing: "0.08em", fill: "var(--muted-foreground)" }}>
              STRUCTURE {String(active + 1).padStart(2, "0")}
            </text>
          )}
          <text x={96} y={790} style={{ font: `650 48px ${sans}`, letterSpacing: "-0.01em", fill: "var(--foreground)" }}>
            {K.name}
          </text>
        </g>
        <g opacity={interpolate(f, [70, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * out}>
          {STRUCTURE_BARS.map((l, i) => (
            <g key={l} transform={`translate(700 ${708 + i * 30})`}>
              <text x={0} y={7} style={plain ? { font: `500 19px ${sans}`, fill: "var(--muted-foreground)" } : { font: `500 15px ${mono}`, letterSpacing: "0.04em", fill: "var(--muted-foreground)" }}>
                {plain ? l : l.toUpperCase()}
              </text>
              <rect x={250} y={-6} width={154} height={10} rx={5} fill="var(--border)" />
              <rect x={250} y={-6} width={(154 * scores[i]) / 5} height={10} rx={5} fill="var(--foreground)" />
            </g>
          ))}
        </g>
        {children}
      </svg>
  )
}
