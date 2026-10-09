import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion"
import { STRUCTURE_BARS, STRUCTURES, type StructureKind } from "@/data/labs"

/*
  Hero film: the drafting table builds an organization, then redraws it
  as each of the four structures from session 3. 1200 x 900, 30 fps, 14 s loop (size and timing in hero-spec.ts).
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
// state k holds from START[k]; transitions take 30 frames
const START = [0, 120, 210, 300]
const ease = Easing.bezier(0.2, 0.7, 0.2, 1)

function weights(f: number) {
  const w = [0, 0, 0, 0]
  if (f < START[1]) w[0] = 1
  for (let k = 1; k < 4; k++) {
    const t = interpolate(f, [START[k], START[k] + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease })
    if (f >= START[k]) {
      w.fill(0)
      w[k - 1] = 1 - t
      w[k] = t
    }
  }
  return w
}
const mix = (w: number[], get: (k: StructureKind) => number[]) =>
  KINDS.reduce((acc, k, i) => [acc[0] + get(k)[0] * w[i], acc[1] + get(k)[1] * w[i]], [0, 0])

const mono = "var(--font-martian), ui-monospace, monospace"
const sans = "var(--font-bricolage), system-ui, sans-serif"

export function HeroFilm() {
  const f = useCurrentFrame()
  const { fps } = useVideoConfig()
  const w = weights(f)
  const active = w.indexOf(Math.max(...w))
  const build = (delay: number) => spring({ frame: f - delay, fps, config: { damping: 14, stiffness: 140, mass: 0.6 } })
  const out = interpolate(f, [384, 412], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) })
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
  const capIn = (k: number) =>
    k === 0 ? interpolate(f, [60, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : interpolate(f, [START[k] + 8, START[k] + 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  const capOut = active < 3 ? interpolate(f, [START[active + 1] - 4, START[active + 1] + 8], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1
  const cap = Math.min(capIn(active), capOut) * out
  const scores = [0, 1, 2, 3].map((i) => KINDS.reduce((acc, k, j) => acc + STRUCTURES[k].score[i] * w[j], 0))
  const loop = build(30) * out
  const leadR = 27

  return (
    <AbsoluteFill style={{ background: "var(--card)" }}>
      <svg viewBox="0 0 1200 900" width="100%" height="100%">
        <defs>
          <pattern id="hf-minor" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" fill="none" stroke="var(--grid)" strokeWidth="1" />
          </pattern>
          <pattern id="hf-major" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="url(#hf-minor)" />
            <path d="M100 0H0V100" fill="none" stroke="var(--grid)" strokeWidth="1.5" />
          </pattern>
        </defs>
        <rect width="1200" height="900" fill="url(#hf-major)" opacity={gridO} />

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
          SHEET S03 · LEADING THROUGH DESIGN
        </text>
        <text x={1104} y={112} textAnchor="end" style={{ font: `500 19px ${mono}`, letterSpacing: "0.08em", fill: "var(--muted-foreground)" }} opacity={gridO}>
          {String(active + 1).padStart(2, "0")} / 04
        </text>

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
                <text y={9} textAnchor="middle" style={{ font: `600 25px ${sans}`, fill: "var(--foreground)" }} opacity={cap > 0.05 || f < 120 ? 1 : 0.35}>
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
          <text x={96} y={738} style={{ font: `500 18px ${mono}`, letterSpacing: "0.08em", fill: "var(--muted-foreground)" }}>
            STRUCTURE {String(active + 1).padStart(2, "0")}
          </text>
          <text x={96} y={790} style={{ font: `650 48px ${sans}`, letterSpacing: "-0.01em", fill: "var(--foreground)" }}>
            {K.name}
          </text>
        </g>
        <g opacity={interpolate(f, [70, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * out}>
          {STRUCTURE_BARS.map((l, i) => (
            <g key={l} transform={`translate(700 ${708 + i * 30})`}>
              <text x={0} y={7} style={{ font: `500 15px ${mono}`, letterSpacing: "0.04em", fill: "var(--muted-foreground)" }}>
                {l.toUpperCase()}
              </text>
              <rect x={250} y={-6} width={154} height={10} rx={5} fill="var(--border)" />
              <rect x={250} y={-6} width={(154 * scores[i]) / 5} height={10} rx={5} fill="var(--foreground)" />
            </g>
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  )
}
