"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { GAMES, type GameId } from "@/data/games"
import { useProgress } from "@/lib/store"
import { cn } from "@/lib/utils"

/* Each game gets a small drawing in the brand's drafting style. */
function Glyph({ id }: { id: GameId }) {
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

export function Arcade({ compact }: { compact?: boolean }) {
  const { lab, ready } = useProgress()
  const stat = (id: GameId) => {
    if (!ready) return null
    if (id === "culture") return lab<string | null>("g-culture", null)
    if (id === "conflict") return lab<string | null>("g-conflict", null)
    if (id === "bias") {
      const b = lab<number>("g-bias-best", 0)
      return b ? `Best ${b}` : null
    }
    const c = lab<number>("g-climb-best", 0)
    return c ? `Best ${(c / 1000).toFixed(1)}s` : null
  }
  return (
    <ul className={cn("grid gap-3 sm:grid-cols-2", !compact && "lg:grid-cols-4")}>
      {GAMES.map((g, i) => {
        const s = stat(g.id)
        return (
          <li key={g.id} className="min-w-0">
            <Link
              href={`/play/${g.id}/`}
              className="group corners rise drafting-grid flex h-full min-h-[236px] flex-col border border-border bg-card p-4 transition-[border-color,transform] duration-(--dur-ui) hover:-translate-y-0.5 hover:border-foreground/70"
              style={{ ["--delay" as string]: `${i * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="label-mono">
                  {g.kind} · {g.minutes}
                </span>
                <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
              <div className="my-4">
                <Glyph id={g.id} />
              </div>
              <h3 className="mt-auto text-xl leading-tight font-semibold tracking-[-0.01em]">{g.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{g.blurb}</p>
              {s && <p className="mt-3 font-mono text-xs font-medium tnum">YOU: {String(s).toUpperCase()}</p>}
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
        "group corners flex items-center gap-4 border bg-card p-4 transition-colors hover:border-foreground/70",
        play ? "border-signal" : "border-border"
      )}
    >
      <Glyph id={g.id} />
      <span className="grid min-w-0 gap-0.5">
        <span className={cn("label-mono", play && "!text-signal-text")}>Play this sheet · {g.minutes}</span>
        <span className="text-lg leading-tight font-semibold">{g.title}</span>
        <span className="text-sm text-muted-foreground">{g.blurb}</span>
      </span>
      <ArrowUpRight className="ml-auto size-5 shrink-0 text-muted-foreground" />
    </Link>
  )
}
