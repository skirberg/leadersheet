"use client"

import Link from "next/link"
import type { SheetSummary } from "@/data/course"
import { fmtMono } from "@/data/schedule"
import { useProgress } from "@/lib/store"
import { cn } from "@/lib/utils"

export function Dots({ n }: { n: number | undefined }) {
  return (
    <span className="inline-flex gap-1" aria-label={n == null ? "Check not taken" : `Check: ${n} of 3`}>
      {[0, 1, 2].map((i) => (
        <i key={i} className={cn("block size-2 rounded-full border border-foreground/50", n != null && i < n && "border-ok bg-ok")} />
      ))}
    </span>
  )
}

export function SheetCard({ s }: { s: SheetSummary; i?: number }) {
  const { state, current, ready, classMode } = useProgress()
  const isNow = ready && classMode && current.id === s.id
  return (
    <Link
      href={`/learn/${s.id}/`}
      className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 py-5 press sm:py-6"
    >
      <span className="grid gap-1.5">
        <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-2xl leading-tight font-semibold tracking-[-0.015em] underline-offset-[6px] decoration-1 group-hover:underline sm:text-[28px]">
            {s.title}
          </span>
          {isNow && <span className="rounded-full bg-foreground px-2.5 py-0.5 text-[13px] font-medium text-background">This week</span>}
          {classMode && !isNow && <span className="text-[13px] text-muted-foreground">{fmtMono(s.date)}</span>}
        </span>
        <span className="max-w-[62ch] text-[15px] leading-snug text-muted-foreground sm:text-base">{s.idea}</span>
      </span>
      <span className="self-center">
        <Dots n={state.best[s.id]} />
      </span>
    </Link>
  )
}

/** The twelve sheets. The page passes their summaries in, so the full course never reaches the browser. */
export function SheetGrid({ sheets }: { sheets: SheetSummary[] }) {
  return (
    <ol className="divide-y divide-border border-y border-border">
      {sheets.map((s) => (
        <li key={s.id} className="min-w-0">
          <SheetCard s={s} />
        </li>
      ))}
    </ol>
  )
}

export function CheckCount({ sheets }: { sheets: SheetSummary[] }) {
  const { state } = useProgress()
  const won = sheets.filter((s) => (state.best[s.id] ?? 0) >= 3).length
  return (
    <span className="text-[15px] text-muted-foreground tnum">
      {won} of 12 checked
    </span>
  )
}
