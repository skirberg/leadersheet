"use client"

import Link from "next/link"
import { SESSIONS } from "@/data/course"
import { useProgress } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Dots } from "./sheets"

export function SheetRail({ currentId }: { currentId: string }) {
  const { state } = useProgress()
  return (
    <ol className="grid gap-0.5">
      {SESSIONS.map((s) => {
        const on = s.id === currentId
        return (
          <li key={s.id}>
            <Link
              href={`/learn/${s.id}/`}
              aria-current={on ? "page" : undefined}
              className={cn(
                "grid min-h-10 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-full px-4 py-1.5 text-[15px] transition-colors hover:bg-muted",
                on && "bg-muted font-semibold"
              )}
            >
              <span className="truncate">{s.title}</span>
              <Dots n={state.best[s.id]} />
            </Link>
          </li>
        )
      })}
    </ol>
  )
}
