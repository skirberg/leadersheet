"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import type { SheetSummary } from "@/data/course"
import { fmtMono, sheetNo } from "@/data/schedule"
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

export function SheetCard({ s, i = 0 }: { s: SheetSummary; i?: number }) {
  const { state, current, ready, classMode } = useProgress()
  const isNow = ready && classMode && current.id === s.id
  return (
    <Link
      href={`/learn/${s.id}/`}
      className={cn(
        "group corners rise relative flex min-h-[136px] flex-col sm:min-h-[188px] border border-border bg-card p-4 transition-[border-color,transform] duration-(--dur-ui) hover:-translate-y-0.5 hover:border-foreground/70",
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
      <h3 className="mt-auto pt-4 text-[19px] sm:pt-6 leading-tight font-semibold">{s.title}</h3>
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-dashed border-border pt-2.5">
        <span className="label-mono !text-[10px]">
          {classMode ? `${fmtMono(s.date)} · ${s.part}` : s.part}
        </span>
        <Dots n={state.best[s.id]} />
      </div>
    </Link>
  )
}

/** The twelve sheets. The page passes their summaries in, so the full course never reaches the browser. */
export function SheetGrid({ sheets }: { sheets: SheetSummary[] }) {
  return (
    <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {sheets.map((s, i) => (
        <li key={s.id} className="min-w-0">
          <SheetCard s={s} i={i} />
        </li>
      ))}
    </ol>
  )
}

export function CheckCount({ sheets }: { sheets: SheetSummary[] }) {
  const { state } = useProgress()
  const won = sheets.filter((s) => (state.best[s.id] ?? 0) >= 3).length
  return (
    <span className="font-mono text-xs text-muted-foreground tnum">
      {won} / 12 SIGNED OFF
    </span>
  )
}
