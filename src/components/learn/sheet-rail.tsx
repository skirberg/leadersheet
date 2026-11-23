"use client"

import Link from "next/link"
import { SESSIONS } from "@/data/course"
import { lessonHref } from "@/lib/paths"
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
              href={lessonHref(s)}
              aria-current={on ? "page" : undefined}
              className={cn(
                "grid min-h-10 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[20px] px-4 py-2 text-base leading-snug transition-colors hover:bg-muted",
                on && "bg-muted font-semibold"
              )}
            >
              <span>{s.title}</span>
              <Dots n={state.best[s.id]} />
            </Link>
          </li>
        )
      })}
    </ol>
  )
}
