"use client"

import Link from "next/link"
import { SESSIONS, sheetNo } from "@/data/course"
import { useProgress } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Dots } from "./sheets"

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
