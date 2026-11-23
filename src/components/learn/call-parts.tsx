"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowUpRight, Check as CheckIcon, ChevronDown, X } from "lucide-react"
import type { Framework } from "@/data/course"
import { GRADE_LABEL, type Grade } from "@/data/cases"
import { rowParts } from "@/lib/rail"
import { cn } from "@/lib/utils"

export { PAIRED, rowLine, rowParts } from "@/lib/rail"

/*
  The parts a decision's result is drawn with, shared by a lesson's Your call, Today's call and class mode.

  Built after looking at how the best reveal an answer without a paragraph (design pass, 20 November 2026): NYT Games
  marks the answers in place, in the grid you played, with color carrying right and wrong; Brilliant explains a pick
  where you made it; Our World in Data and NYC ZoLa write the name on the thing instead of a legend. So the calls stay
  where they were, each takes its mark, yours says what follows, and the others open on a tap. The framework becomes a
  rail with every call's mark standing on the row it uses, instead of a row of chips and a sentence repeating them.
*/

/** A grade as a mark: a check in the ok green, a filled dot, an X in ink. Never pink. */
export function GradeMark({ g, big, className }: { g: Grade; big?: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-full border",
        big ? "size-7" : "size-5",
        g === "strong" ? "border-ok bg-ok text-background" : "border-foreground bg-foreground text-background",
        className
      )}
    >
      {g === "strong" ? <CheckIcon className={big ? "size-4" : "size-3"} strokeWidth={3} /> : g === "costly" ? <X className={big ? "size-4" : "size-3"} strokeWidth={3} /> : <span className={cn("block rounded-full bg-background", big ? "size-2" : "size-1.5")} />}
    </span>
  )
}

export type RailMark = { row: number; grade: Grade; you?: boolean; tag?: string }

/**
 * The framework as a rail: one stop per row, every call's mark standing on the row it uses, and the row in focus
 * named under its stop. The name slides when the focus moves (another call opened), so the comparison is drawn.
 */
export function FrameworkRail({ f, marks, at, className }: { f: Framework; marks: RailMark[]; at: number; className?: string }) {
  const n = f.rows.length
  const pct = (i: number) => (n === 1 ? 50 : (i / (n - 1)) * 100)
  const stacks = new Map<number, RailMark[]>()
  for (const m of marks) stacks.set(m.row, [...(stacks.get(m.row) ?? []), m])
  const tall = Math.max(1, ...[...stacks.values()].map((s) => s.length))
  const { name, gloss } = rowParts(f, at)
  const said = (m: RailMark) => `${m.tag ? `${m.tag}, ` : m.you ? "yours, " : ""}${GRADE_LABEL[m.grade].toLowerCase()}: ${rowParts(f, m.row).name}`
  const label = `${f.name}, ${n} ${n === 1 ? "row" : "rows"}. ${marks.map(said).join("; ")}.`
  return (
    // One column that never grows past the card: the row's name below is sized to its text (w-max), and in an auto
    // column a long name widened the whole rail past a phone's screen, so the page scrolled sideways (22 November 2026:
    // 59 of 150 calls at 320 px).
    <figure className={cn("grid min-w-0 grid-cols-[minmax(0,1fr)] gap-2", className)}>
      <Link href={`/frameworks/${f.id}/`} className="label-mono -my-2 inline-flex min-h-11 w-fit items-center gap-1 text-foreground underline-offset-4 hover:underline">
        {f.name} <ArrowUpRight aria-hidden className="size-4 text-muted-foreground" />
      </Link>
      <div role="img" aria-label={label} className="relative mx-3" style={{ height: 14 + tall * 24 }}>
        <span aria-hidden className="absolute inset-x-0 bottom-[6px] h-px bg-rule/60" />
        {f.rows.map((_, i) => {
          const s = stacks.get(i) ?? []
          const lit = i === at
          return (
            <React.Fragment key={i}>
              <span
                aria-hidden
                className={cn(
                  "absolute bottom-[1px] size-[11px] -translate-x-1/2 rounded-full border transition-colors duration-(--dur-ui)",
                  lit ? "border-foreground bg-foreground" : s.length ? "border-foreground bg-card" : "border-rule/70 bg-card"
                )}
                style={{ left: `${pct(i)}%` }}
              />
              {s.length > 0 && (
                <span aria-hidden className="absolute bottom-[16px] flex -translate-x-1/2 flex-col-reverse items-center gap-1" style={{ left: `${pct(i)}%` }}>
                  {s.map((m, k) => (
                    <span key={k} className="relative grid place-items-center">
                      <GradeMark g={m.grade} className={cn(m.you && "ring-2 ring-foreground ring-offset-2 ring-offset-card")} />
                      {m.tag && <span className="absolute -top-0.5 -right-3 font-mono text-xs leading-none font-semibold">{m.tag}</span>}
                    </span>
                  ))}
                </span>
              )}
            </React.Fragment>
          )
        })}
      </div>
      <div className="mx-3" aria-hidden>
        <p
          className="relative w-max max-w-[min(100%,34ch)] text-base leading-snug transition-[left,transform] duration-(--dur-draw) ease-(--ease-draft)"
          style={{ left: `${pct(at)}%`, transform: `translateX(-${pct(at)}%)`, textAlign: pct(at) > 66 ? "right" : pct(at) < 34 ? "left" : "center" }}
        >
          <b className="font-semibold">{name}</b>
          {gloss && <span className="block text-sm text-muted-foreground">{gloss}</span>}
        </p>
      </div>
    </figure>
  )
}

/**
 * A call that was not yours: its mark and words, and a tap opens what follows. The grade's word is the control's
 * label, so the mark is never left to decode.
 */
export function OtherCall({ grade, says, then, open, onToggle, tag, id, big }: { grade: Grade; says: string; then: string; open: boolean; onToggle: () => void; tag?: string; id: string; big?: boolean }) {
  return (
    <li className="grid">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={onToggle}
        className={cn(
          "grid min-h-11 grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-3 rounded-md px-4 py-3 text-left transition-colors duration-(--dur-ui) hover:bg-muted",
          big ? "text-xl leading-snug" : "text-base leading-snug",
          open && "bg-muted"
        )}
      >
        <span className="flex items-center gap-3">
          {tag && <span className="font-mono text-3xl leading-none font-medium">{tag}</span>}
          <GradeMark g={grade} big={big} className="mt-0.5" />
        </span>
        <span className={cn(open && "font-semibold")}>{says}</span>
        <span className={cn("label-mono inline-flex items-center gap-1 whitespace-nowrap", grade === "strong" ? "text-ok" : "text-foreground")}>
          {GRADE_LABEL[grade]}
          <ChevronDown aria-hidden className={cn("size-4 transition-transform duration-(--dur-ui)", open && "rotate-180")} />
        </span>
      </button>
      <p id={id} hidden={!open} className={cn("pr-4 pb-3 leading-relaxed", big ? "pl-[6.5rem] text-lg" : "pl-12 text-base")}>
        {then}
      </p>
    </li>
  )
}
