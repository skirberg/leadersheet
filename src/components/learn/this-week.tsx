"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TitleBlock } from "@/components/brand/title-block"
import { useProgress } from "@/lib/store"
import { fmtMono, sheetNo } from "@/data/course"

export function ThisWeek() {
  const { current: s, state } = useProgress()
  const best = state.best[s.id]
  return (
    <section aria-labelledby="tw-h" className="corners border border-foreground bg-card">
      <TitleBlock
        className="border-t-0 border-l-0"
        cells={[
          { k: "Sheet", v: sheetNo(s.n) },
          { k: "Class", v: fmtMono(s.date) },
          { k: "Part", v: s.part, wide: true },
          { k: "Check", v: best == null ? "Not taken" : `${best} of 3` },
        ]}
      />
      <div className="grid gap-8 p-5 sm:p-7 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="grid content-start gap-4">
          <p className="label-mono">This week</p>
          <h2 id="tw-h" className="text-3xl leading-[1.05] font-semibold tracking-[-0.02em] sm:text-4xl">
            {s.title}
          </h2>
          <p className="max-w-[56ch] text-lg leading-snug text-muted-foreground">{s.idea}</p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button asChild size="lg">
              <Link href={`/learn/${s.id}/`}>
                Open sheet {sheetNo(s.n)} <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="grid content-start gap-3 lg:border-l lg:border-dashed lg:border-border lg:pl-8">
          <p className="label-mono">Due before class</p>
          {s.due.length ? (
            <ul className="grid gap-2">
              {s.due.map((d) => (
                <li key={d} className="flex gap-3 text-[15px]">
                  <span aria-hidden className="mt-2 block size-1.5 shrink-0 bg-foreground" />
                  {d}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Nothing due before this class.</p>
          )}
          {s.readings.length > 0 && (
            <>
              <p className="label-mono pt-3">Readings</p>
              <ul className="grid gap-1.5 text-[15px]">
                {s.readings.map((r) => (
                  <li key={r.t}>
                    <b className="font-semibold">{r.t}</b> <span className="text-muted-foreground">· {r.a}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

/** Hero call to action: goes straight to the current sheet. */
export function OpenThisWeek() {
  const { current } = useProgress()
  return (
    <Button asChild size="lg">
      <Link href={`/learn/${current.id}/`}>
        Open this week’s sheet <ArrowRight className="size-4" />
      </Link>
    </Button>
  )
}
