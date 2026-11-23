"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { GAMES, readValues, type GameId } from "@/data/games"
import { JDS_ITEMS, jdsScore } from "@/data/jds"
import { TALKS } from "@/data/rewind"
import { BRS_ITEMS, brsScore } from "@/data/brs"
import { constraint, emptyTies } from "@/lib/network"
import { RESULT_GAMES, SPREAD, type ResultGame } from "@/data/results"
import { useProgress } from "@/lib/store"
import { cn } from "@/lib/utils"

/* Each game gets a small drawing in the brand's drafting style. */
export function Glyph({ id }: { id: GameId }) {
  if (id === "team") {
    // Six people, every pair joined: the 15 lines Team math starts from.
    const pts = Array.from({ length: 6 }, (_, i) => [60 + Math.cos(-Math.PI / 2 + (i * Math.PI) / 3) * 30, 40 + Math.sin(-Math.PI / 2 + (i * Math.PI) / 3) * 30] as const)
    return (
      <svg viewBox="0 0 120 80" className="viz h-20 w-auto" aria-hidden>
        {pts.flatMap((a, i) => pts.slice(i + 1).map((b, j) => <path key={`${i}-${j}`} d={`M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}`} className="edge" strokeWidth={1} />))}
        {pts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={5} className={i === 0 ? "fill-signal" : "node"} />
        ))}
      </svg>
    )
  }
  if (id === "decide")
    return (
      <svg viewBox="0 0 120 80" className="viz h-20 w-auto" aria-hidden>
        <path d="M8 6H112L8 58Z" className="fill-soft" />
        <rect x={8} y={6} width={104} height={52} className="grid-line" />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={9 + i * 26} y={66} width={24} height={8} rx={4} className={i === 2 ? "fill-signal" : "fill-ink"} />
        ))}
      </svg>
    )
  if (id === "culture")
    return (
      <svg viewBox="0 0 120 80" className="viz h-20 w-auto" aria-hidden>
        <rect x={6} y={6} width={108} height={68} rx={3} className="grid-line" />
        <path d="M60 6V74M6 40H114" className="grid-line" />
        {[[30, 22], [84, 18], [100, 34], [24, 50], [44, 66], [64, 70], [96, 60]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={4} className="node" />
        ))}
        <circle cx={42} cy={30} r={7} className="fill-signal" />
      </svg>
    )
  if (id === "conflict")
    return (
      <svg viewBox="0 0 120 80" className="viz h-20 w-auto" aria-hidden>
        <path d="M14 70H114M14 70V6" className="edge-ink" />
        {[[30, 58], [98, 58], [64, 38], [30, 16], [98, 16]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={4} className="node" />
        ))}
        <circle cx={80} cy={26} r={7} className="fill-signal" />
      </svg>
    )
  if (id === "style")
    return (
      <svg viewBox="0 0 120 80" className="viz h-20 w-auto" aria-hidden>
        <path d="M6 74H114" className="edge-ink" />
        {[30, 52, 22, 40, 60, 34].map((h, i) => (
          <rect key={i} x={10 + i * 18} y={74 - h} width={12} height={h} rx={1.5} className={i === 4 ? "fill-signal" : "fill-ink"} />
        ))}
      </svg>
    )
  if (id === "power")
    return (
      <svg viewBox="0 0 120 80" className="viz h-20 w-auto" aria-hidden>
        {[[60, 10], [92, 26], [92, 56], [60, 72], [28, 56], [28, 26]].map(([x, y], i) => (
          <g key={i}>
            <path d={`M60 41L${x} ${y}`} className="grid-line" />
            <circle cx={x} cy={y} r={5} className={i === 1 ? "fill-signal" : "node"} />
          </g>
        ))}
        <circle cx={60} cy={41} r={7} className="fill-ink" />
      </svg>
    )
  if (id === "listen")
    return (
      <svg viewBox="0 0 120 80" className="viz h-20 w-auto" aria-hidden>
        <circle cx={34} cy={40} r={7} className="fill-signal" />
        {[16, 30, 44].map((r) => (
          <path key={r} d={`M${34 + r * 0.7} ${40 - r * 0.7}A${r} ${r} 0 0 1 ${34 + r * 0.7} ${40 + r * 0.7}`} className="edge-ink" fill="none" strokeWidth={2} strokeLinecap="round" />
        ))}
        <circle cx={100} cy={40} r={5} className="node" />
      </svg>
    )
  if (id === "values")
    return (
      <svg viewBox="0 0 120 80" className="viz h-20 w-auto" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={10} y={8 + i * 14} width={100 - i * 16} height={9} rx={4.5} className={i === 0 ? "fill-signal" : i < 3 ? "fill-ink" : "fill-soft"} />
        ))}
      </svg>
    )
  if (id === "job")
    return (
      <svg viewBox="0 0 120 80" className="viz h-20 w-auto" aria-hidden>
        {[62, 48, 84, 30, 56].map((w, i) => (
          <g key={i}>
            <rect x={10} y={8 + i * 14} width={100} height={8} rx={4} className="fill-soft" />
            <rect x={10} y={8 + i * 14} width={w} height={8} rx={4} className={i === 3 ? "fill-signal" : "fill-ink"} />
          </g>
        ))}
        <path d="M74 4V76" className="edge-ink" strokeDasharray="3 3" />
      </svg>
    )
  if (id === "rewind")
    return (
      <svg viewBox="0 0 120 80" className="viz h-20 w-auto" aria-hidden>
        <rect x={8} y={8} width={64} height={16} rx={8} className="fill-soft" />
        <rect x={48} y={32} width={64} height={16} rx={8} className="fill-ink" />
        <rect x={8} y={56} width={52} height={16} rx={8} className="fill-soft" />
        <path d="M100 66a10 10 0 1 1-4-12" className="edge-ink" fill="none" strokeWidth={3} strokeLinecap="round" />
        <path d="M96 48v7h7" stroke="var(--signal)" fill="none" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  if (id === "network")
    return (
      <svg viewBox="0 0 120 80" className="viz h-20 w-auto" aria-hidden>
        {[[24, 18], [14, 46], [40, 62], [96, 20], [104, 54]].map(([x, y], i) => (
          <path key={i} d={`M60 40L${x} ${y}`} className="grid-line" />
        ))}
        <path d="M24 18L14 46L40 62L24 18M96 20L104 54" className="edge-ink" fill="none" strokeWidth={1.6} />
        {[[24, 18], [14, 46], [40, 62], [96, 20], [104, 54]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={5} className="node" />
        ))}
        <circle cx={60} cy={40} r={7} className="fill-signal" />
      </svg>
    )
  if (id === "bounce")
    return (
      <svg viewBox="0 0 120 80" className="viz h-20 w-auto" aria-hidden>
        <path d="M6 22H34C46 22 48 66 60 66S74 22 86 22H114" className="edge-ink" fill="none" strokeWidth={3} strokeLinecap="round" />
        <path d="M6 74H114" className="grid-line" />
        <circle cx={86} cy={22} r={6} className="fill-signal" />
      </svg>
    )
  if (id === "bias")
    return (
      <svg viewBox="0 0 120 80" className="viz h-20 w-auto" aria-hidden>
        <circle cx={60} cy={42} r={30} className="node" />
        <path d="M60 42V22" className="edge-ink" strokeWidth={3} strokeLinecap="round" />
        <path d="M60 42L74 50" stroke="var(--signal)" strokeWidth={3} strokeLinecap="round" />
        <path d="M52 6H68M60 6V12" className="edge-ink" strokeWidth={3} />
      </svg>
    )
  return (
    <svg viewBox="0 0 120 80" className="viz h-20 w-auto" aria-hidden>
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={6 + i * 14} y={66 - i * 8} width={12} height={8 + i * 8} rx={1.5} className={i === 7 ? "fill-signal" : i < 5 ? "fill-ink" : "fill-soft"} />
      ))}
    </svg>
  )
}

/** `Title` is the games' heading level: h3 under a section's h2 (home), h2 where the arcade is the page (/play/). */
/**
 * The games as cards on the page grid: the gap is the gutter, so on all twelve columns four cards take three columns
 * each, and in a section's main column (nine) three do. Two across from 640 px, one on a phone.
 */
export function Arcade({ across = 4, Title = "h3" }: { across?: 3 | 4; Title?: "h2" | "h3" }) {
  const { lab, ready } = useProgress()
  const stat = (id: GameId) => {
    if (!ready) return null
    if (id in RESULT_GAMES) {
      const c = lab<string | null>(`g-${id}`, null)
      return c === SPREAD ? RESULT_GAMES[id as ResultGame].label(SPREAD) : c
    }
    if (id === "values") {
      const v = readValues(lab<unknown>("g-values", null))
      return v ? `${v.ranked[0]} first` : null
    }
    if (id === "team") {
      const t = lab<number | null>("g-team-best", null)
      return t === null ? null : `Best ${t} of 3`
    }
    if (id === "rewind") {
      const b = lab<number>("g-rewind-best", 0)
      return b ? `Best ${b} of ${TALKS[0].turns.length} strong` : null
    }
    if (id === "job") {
      const j = lab<{ a: number[] } | null>("g-job", null)
      return j?.a?.length === JDS_ITEMS.length ? `MPS ${Math.round(jdsScore(j.a).mps)}` : null
    }
    if (id === "network") {
      const m = lab<{ names: string[]; pairs: [number, number][] } | null>("g-network", null)
      if (!m || m.names.length < 3) return null
      const t = emptyTies(m.names.length)
      for (const [x, y] of m.pairs) if (t[x] && t[y]) t[x][y] = t[y][x] = true
      return `Constraint ${Math.round(constraint(t).total * 100)}`
    }
    if (id === "bounce") {
      const r = lab<{ a: number[] } | null>("g-bounce", null)
      return r?.a?.length === BRS_ITEMS.length ? `Score ${brsScore(r.a).toFixed(2)}` : null
    }
    if (id === "bias") {
      const b = lab<number>("g-bias-best", 0)
      return b ? `Best ${b}` : null
    }
    const c = lab<number>("g-climb-best", 0)
    return c ? `Best ${(c / 1000).toFixed(1)}s` : null
  }
  return (
    <ul className={cn("grid gap-(--gutter) sm:grid-cols-2", across === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3")}>
      {GAMES.map((g, i) => {
        const s = stat(g.id)
        return (
          <li key={g.id} className="min-w-0">
            <Link
              href={`/play/${g.id}/`}
              className="group rise flex h-full min-h-[236px] flex-col rounded-2xl bg-card p-5 press hover:-translate-y-0.5 hover:bg-muted"
              style={{ ["--delay" as string]: `${i * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="label-mono">
                  {g.search} · {g.minutes}
                </span>
                <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
              <div className="my-4">
                <Glyph id={g.id} />
              </div>
              <Title className="mt-auto font-sans text-xl leading-tight font-semibold tracking-[-0.01em]">{g.title}</Title>
              {s && <p className="mt-3 text-sm font-medium">You: {String(s)}</p>}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

/** On a sheet: points to the game that drills this sheet's idea. */
export function PlayCallout({ sheet }: { sheet: string }) {
  const g = GAMES.find((x) => x.sheet === sheet)
  const { mode, ready } = useProgress()
  if (!g) return null
  const play = ready && mode === "play"
  return (
    <Link
      href={`/play/${g.id}/`}
      className={cn(
        "group press flex items-center gap-4 rounded-2xl bg-card p-5 hover:bg-muted sm:px-6",
        play && "ring-2 ring-signal"
      )}
    >
      <Glyph id={g.id} />
      <span className="grid min-w-0 gap-0.5">
        <span className={cn("label-mono", play && "!text-signal-text")}>Play this lesson · {g.minutes}</span>
        <span className="text-lg leading-tight font-semibold">{g.title}</span>
      </span>
      <ArrowUpRight className="ml-auto size-5 shrink-0 text-muted-foreground" />
    </Link>
  )
}
