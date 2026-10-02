"use client"

import { useProgress } from "@/lib/store"
import { cn } from "@/lib/utils"

/** Renders only in class mode: schedule, dates and what is due. Public visitors never see it. */
export function ClassOnly({ children }: { children: React.ReactNode }) {
  const { classMode } = useProgress()
  return classMode ? <>{children}</> : null
}

export function ClassModeToggle({ className }: { className?: string }) {
  const { classMode, setClassMode, ready } = useProgress()
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ready && classMode}
      onClick={() => setClassMode(!classMode)}
      className={cn("inline-flex min-h-11 items-center gap-3 text-sm font-semibold", className)}
    >
      <span
        aria-hidden
        className={`relative h-6 w-10 shrink-0 rounded-full border border-rule/60 transition-colors duration-(--dur-ui) ${ready && classMode ? "bg-foreground" : "bg-muted"}`}
      >
        <span
          className={`absolute top-0.5 size-[18px] rounded-full bg-background shadow-[0_0_0_1px_var(--rule)] transition-[left] duration-(--dur-ui) ${ready && classMode ? "left-[18px]" : "left-0.5"}`}
        />
      </span>
      Class mode
    </button>
  )
}
