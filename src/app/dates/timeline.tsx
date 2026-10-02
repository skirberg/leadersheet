"use client"

import Link from "next/link"
import { SESSIONS, fmtMono, sheetNo } from "@/data/course"
import { useProgress } from "@/lib/store"
import { cn } from "@/lib/utils"

export function Timeline() {
  const { current, ready } = useProgress()
  return (
    <ol className="relative border-l-2 border-foreground">
      {SESSIONS.map((s) => {
        const now = ready && s.id === current.id
        return (
          <li key={s.id} className={cn("relative grid gap-1 border-b border-border py-4 pr-2 pl-6 sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:gap-4", now && "bg-card")}>
            <span aria-hidden className={cn("absolute top-[22px] -left-[7px] size-3 rounded-full border-2 border-foreground bg-background", now && "border-pencil bg-pencil")} />
            <span className="font-mono text-[13px] font-medium tnum">
              {fmtMono(s.date)}
              <span className="block text-[11px] font-normal text-muted-foreground">{sheetNo(s.n)}</span>
            </span>
            <div className="grid gap-1">
              <Link href={`/learn/${s.id}/`} className="w-fit font-semibold underline-offset-4 hover:underline">
                {s.title}
                {now && <span className="ml-2 rounded-[3px] bg-foreground px-1.5 py-0.5 align-middle font-mono text-[10px] font-medium tracking-wider text-background">NEXT</span>}
              </Link>
              {s.due.length > 0 && <p className="text-sm text-muted-foreground">{s.due.join(" · ")}</p>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
