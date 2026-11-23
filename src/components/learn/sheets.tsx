"use client"

import Link from "next/link"
import type { SheetSummary } from "@/data/course"
import { lessonHref } from "@/lib/paths"
import { useProgress } from "@/lib/store"
import { nextSheet } from "./this-week"
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
  const { state } = useProgress()
  return (
    <Link
      href={lessonHref(s)}
      className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 py-5 press sm:py-6"
    >
      <span className="text-2xl leading-tight font-semibold tracking-[-0.015em] underline-offset-[6px] decoration-1 group-hover:underline sm:text-[28px]">
        {s.title}
      </span>
      <span className="self-center">
        <Dots n={state.best[s.id]} />
      </span>
    </Link>
  )
}

/** Lessons in their parts, in course order: the units of the path. */
export function byPart(sheets: SheetSummary[]) {
  const parts: { name: string; sheets: SheetSummary[] }[] = []
  for (const s of sheets) {
    const last = parts[parts.length - 1]
    if (last?.name === s.part) last.sheets.push(s)
    else parts.push({ name: s.part, sheets: [s] })
  }
  return parts
}

/** Every sheet, under its part. The page passes their summaries in, so the full lessons never reach the browser. */
export function SheetGrid({ sheets }: { sheets: SheetSummary[] }) {
  return (
    <div className="grid gap-8">
      {byPart(sheets).map((p, i) => (
        <section key={p.name} aria-labelledby={`part-${i + 1}`} className="grid gap-1">
          <h3 id={`part-${i + 1}`} className="label-mono">
            Part {i + 1} · {p.name}
          </h3>
          <ol className="divide-y divide-border border-y border-border">
            {p.sheets.map((s) => (
              <li key={s.id} className="min-w-0">
                <SheetCard s={s} />
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  )
}

/**
 * The course as a path, the way Brilliant lays out a course: parts as units, lessons as stops on one line.
 * A checked-off lesson fills in, and the next one to do is marked so a returning visitor knows where to start.
 */
export function LearnPath({ sheets }: { sheets: SheetSummary[] }) {
  const { state, ready } = useProgress()
  const next = ready ? nextSheet(sheets, state.best, state.seen) : undefined
  return (
    // On the page grid: each part's name in the rail (columns 1 to 3), its lessons from column 4 (DESIGN.md, Grid).
    <ol className="span-wide grid grid-cols-subgrid gap-y-(--section)">
      {byPart(sheets).map((p, pi) => {
        // A passed lesson's stop fills in green, so the part needs no count of its own.
        return (
          <li key={p.name} className="span-wide grid grid-cols-subgrid">
            <section aria-labelledby={`unit-${pi + 1}`} className="span-wide grid grid-cols-subgrid gap-y-5">
              <div className="span-rail grid content-start gap-1 lg:sticky lg:top-24 lg:self-start">
                <p className="label-mono">Part {pi + 1}</p>
                <h2 id={`unit-${pi + 1}`} className="text-3xl leading-tight sm:text-4xl">
                  {p.name}
                </h2>
              </div>
              <ol className="span-main lg:max-w-cols-8 relative grid gap-3 before:absolute before:top-8 before:bottom-8 before:left-[39px] before:w-0.5 before:bg-border sm:before:left-[43px]">
                {p.sheets.map((s) => {
                  const best = state.best[s.id]
                  const won = ready && (best ?? 0) >= 3
                  const here = next?.id === s.id
                  return (
                    <li key={s.id} className="relative">
                      <Link
                        href={lessonHref(s)}
                        aria-current={here ? "step" : undefined}
                        className={cn(
                          "group grid grid-cols-[3rem_minmax(0,1fr)] items-center gap-4 rounded-2xl bg-card p-4 press sm:grid-cols-[3.5rem_minmax(0,1fr)_auto] sm:gap-5 sm:p-5",
                          here && "ring-2 ring-foreground"
                        )}
                      >
                        <span
                          aria-hidden
                          className={cn(
                            "grid size-12 place-items-center rounded-full border-2 border-border bg-background font-mono text-sm font-medium tnum sm:size-14",
                            won && "border-ok bg-ok text-background",
                            here && !won && "border-foreground"
                          )}
                        >
                          {s.n}
                        </span>
                        <span className="grid min-w-0 gap-1">
                          {here && <span className="label-mono text-foreground">{Object.keys(state.seen).length ? "Continue here" : "Start here"}</span>}
                          <span className="text-xl leading-tight font-semibold tracking-[-0.01em] underline-offset-4 group-hover:underline">{s.title}</span>
                        </span>
                        <span className="col-start-2 sm:col-start-auto">
                          <Dots n={best} />
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ol>
            </section>
          </li>
        )
      })}
    </ol>
  )
}

/** How many lessons are passed: the count names what it counts, so it needs no explanation. */
export function CheckCount({ sheets, className }: { sheets: SheetSummary[]; className?: string }) {
  const { state } = useProgress()
  const won = sheets.filter((s) => (state.best[s.id] ?? 0) >= 3).length
  // "0 of 24 lessons passed" tells a first visit nothing; the count appears with the first lesson passed.
  if (!won) return null
  return (
    <p className={cn("text-base text-muted-foreground tnum", className)}>
      {won} of {sheets.length} lessons passed
    </p>
  )
}
