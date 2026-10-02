"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { SESSIONS, fmtMono, sheetNo, type Session } from "@/data/course"
import { useProgress } from "@/lib/store"
import { cn } from "@/lib/utils"

function Dots({ n }: { n: number | undefined }) {
  return (
    <span className="inline-flex gap-1" aria-label={n == null ? "Check not taken" : `Check: ${n} of 3`}>
      {[0, 1, 2].map((i) => (
        <i key={i} className={cn("block size-2 rounded-full border border-foreground/50", n != null && i < n && "border-ok bg-ok")} />
      ))}
    </span>
  )
}

export function SheetCard({ s, i = 0 }: { s: Session; i?: number }) {
  const { state, current, ready } = useProgress()
  const isNow = ready && current.id === s.id
  return (
    <Link
      href={`/learn/${s.id}/`}
      className={cn(
        "group corners rise relative flex min-h-[188px] flex-col border border-border bg-card p-4 transition-[border-color,transform] duration-(--dur-ui) hover:-translate-y-0.5 hover:border-foreground/70",
        isNow && "border-foreground"
      )}
      style={{ ["--delay" as string]: `${i * 35}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="font-mono text-[28px] leading-none font-medium tracking-tight tnum">{sheetNo(s.n)}</span>
        {isNow ? (
          <span className="rounded-[3px] bg-foreground px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-wider text-background">THIS WEEK</span>
        ) : (
          <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        )}
      </div>
      <h3 className="mt-auto pt-6 text-[19px] leading-tight font-semibold">{s.title}</h3>
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-dashed border-border pt-2.5">
        <span className="label-mono !text-[10px]">
          {fmtMono(s.date)} · {s.part}
        </span>
        <Dots n={state.best[s.id]} />
      </div>
    </Link>
  )
}

export function SheetGrid() {
  return (
    <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {SESSIONS.map((s, i) => (
        <li key={s.id} className="min-w-0">
          <SheetCard s={s} i={i} />
        </li>
      ))}
    </ol>
  )
}

export function SheetRail({ currentId }: { currentId: string }) {
  const { state } = useProgress()
  return (
    <ol className="border-t border-border">
      {SESSIONS.map((s) => {
        const on = s.id === currentId
        return (
          <li key={s.id}>
            <Link
              href={`/learn/${s.id}/`}
              aria-current={on ? "page" : undefined}
              className={cn(
                "grid min-h-11 grid-cols-[2.6rem_minmax(0,1fr)_auto] items-center gap-2 border-b border-border px-2 py-2 text-sm transition-colors hover:bg-muted",
                on && "bg-muted font-semibold"
              )}
            >
              <span className={cn("font-mono text-xs text-muted-foreground tnum", on && "text-foreground")}>{sheetNo(s.n)}</span>
              <span className="truncate">{s.title}</span>
              <Dots n={state.best[s.id]} />
            </Link>
          </li>
        )
      })}
    </ol>
  )
}

export function CheckCount() {
  const { state } = useProgress()
  const won = SESSIONS.filter((s) => (state.best[s.id] ?? 0) >= 3).length
  return (
    <span className="font-mono text-xs text-muted-foreground tnum">
      {won} / 12 SIGNED OFF
    </span>
  )
}
