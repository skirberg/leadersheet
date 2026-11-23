"use client"

import { WAYS, WAY_POINTS, type Way } from "@/data/decide"
import { cn } from "@/lib/utils"

export type Picked = { tag: string; way: Way; point: number }

/*
  The line itself, drawn the way Tannenbaum and Schmidt drew it: the leader's authority shrinks from left to right as
  the team's freedom grows. Under it, the four ways; the one that leads is the pink one. In the game, each answer sits
  on its own row, so a spread shows where it moved.
*/
export function DecideChart({ top, picks, card, className }: { top?: Way; picks?: Picked[]; card?: boolean; className?: string }) {
  const L = picks ? 150 : 24,
    R = 580
  // Seven points, each an equal slice of the line: Tell is one slice, the other ways two.
  const X = (p: number) => L + ((p - 0.5) / 7) * (R - L)
  const edge = (k: Way) => [X(Math.min(...WAY_POINTS[k]) - 0.5), X(Math.max(...WAY_POINTS[k]) + 0.5)]
  const rows = picks ?? []
  const D = card ? 150 : 84 // the triangle's height
  const band = 8 + D + (card ? 22 : 14)
  const names = band + (card ? 50 : 34)
  const first = names + 36
  const H = rows.length ? first + (rows.length - 1) * 30 + 14 : names + 10
  const label = picks
    ? `The leadership continuum. Your ten answers${top ? `, most of them ${top}` : ", with no clear lead"}: ${rows.map((r) => `${r.tag}, ${r.way}`).join("; ")}.`
    : top
      ? `The leadership continuum, from the leader deciding to the team deciding, with ${top} marked.`
      : "The leadership continuum, from the leader deciding to the team deciding, with every way marked. No clear lead."
  const big = { fontSize: card ? 20 : 14 }
  return (
    <svg className={cn("viz max-w-[560px]", card && "max-w-none", className)} viewBox={`0 0 600 ${H}`} role="img" aria-label={label}>
      <polygon points={`${L},8 ${R},8 ${L},${8 + D}`} className="fill-soft" />
      <rect x={L} y={8} width={R - L} height={D} className="grid-line" />
      <text x={L + 12} y={card ? 40 : 28} style={big}>
        Leader decides
      </text>
      <text x={R - 12} y={D - 4} textAnchor="end" style={big}>
        Team decides
      </text>
      {WAYS.map((k) => {
        const [a, b] = edge(k)
        const on = top ? k === top : !picks
        return (
          <g key={k}>
            <rect x={a + 2} y={band} width={b - a - 4} height={card ? 16 : 10} rx={card ? 8 : 5} className={on ? (top ? "fill-signal" : "fill-ink") : "fill-soft"} />
            <text x={(a + b) / 2} y={names} textAnchor="middle" className="lbl" style={{ fontSize: card ? 26 : 17 }}>
              {k}
            </text>
          </g>
        )
      })}
      {rows.map((r, i) => {
        const y = first + i * 30
        return (
          <g key={r.tag}>
            <text x={0} y={y + 5} style={{ fontSize: 14 }}>
              {r.tag}
            </text>
            <line x1={L} x2={R} y1={y} y2={y} className="grid-line" />
            {[1, 2, 3, 4, 5, 6, 7].map((p) => (
              <circle key={p} cx={X(p)} cy={y} r={2} className="fill-soft" />
            ))}
            <circle cx={X(r.point)} cy={y} r={6.5} className="fill-ink" />
          </g>
        )
      })}
    </svg>
  )
}
