"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProgress } from "@/lib/store"
import type { SheetSummary } from "@/data/course"
import { lessonHref } from "@/lib/paths"

type Sheets = { sheets: SheetSummary[] }

export function nextSheet(sheets: SheetSummary[], best: Record<string, number>, seen: Record<string, 1>) {
  const open = sheets.filter((s) => (best[s.id] ?? 0) < 3)
  const started = open.find((s) => seen[s.id])
  return started ?? open[0] ?? sheets[0]
}

/** Hero call to action: start, or continue with the next unfinished lesson. */
export function OpenThisWeek({ sheets }: Sheets) {
  const { state, ready } = useProgress()
  const s = ready ? nextSheet(sheets, state.best, state.seen) : sheets[0]
  const resuming = ready && Object.keys(state.seen).length > 0
  return (
    <Button asChild size="lg">
      <Link href={lessonHref(s)}>
        {resuming ? `Continue with lesson ${s.n}` : "Start learning"} <ArrowRight className="size-4" />
      </Link>
    </Button>
  )
}
