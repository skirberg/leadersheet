"use client"

import Link from "next/link"
import { ArrowUpRight, X } from "lucide-react"
import { LogoMark } from "@/brand"
import { SESSIONS } from "@/data/course"
import { useProgress } from "@/lib/store"
import { gradeOf, isEmpty, sheetFrom } from "@/lib/sheet"
import { cn } from "@/lib/utils"

/**
 * The way to Your sheet from Practice and the arcade: the mark, the name, and the sheet's own row of calls in
 * miniature (one mark per lesson, empty until you make it), so the link shows what is on the page instead of saying it.
 */
export function SheetLink() {
  const { state, ready } = useProgress()
  const data = ready ? sheetFrom(state) : null
  const empty = !data || isEmpty(data)
  return (
    <Link href="/sheet/" className="group press flex items-center gap-4 rounded-2xl bg-card p-5 hover:bg-muted sm:px-6">
      <LogoMark className="size-10" />
      <span className="grid min-w-0 gap-1.5">
        <span className="text-lg leading-tight font-semibold">Your sheet</span>
        <span className="sr-only">{empty ? ", fills in as you play: calls, results, values" : `, your calls, results and values on one page: calls made in ${data.calls.length} of ${SESSIONS.length} lessons`}</span>
        <span aria-hidden className="flex flex-wrap gap-[3px]">
          {SESSIONS.map((s) => {
            const c = data?.calls.find((x) => x.sheet === s.id)
            const g = c && gradeOf(c)
            return (
              <span
                key={s.id}
                className={cn(
                  "grid size-3 place-items-center rounded-full border",
                  g === "strong" ? "border-ok bg-ok" : g === "tradeoff" ? "border-foreground bg-foreground" : g === "costly" ? "border-foreground text-foreground" : "border-rule/50"
                )}
              >
                {g === "costly" && <X className="size-2" strokeWidth={4} />}
              </span>
            )
          })}
        </span>
      </span>
      <ArrowUpRight className="ml-auto size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </Link>
  )
}
