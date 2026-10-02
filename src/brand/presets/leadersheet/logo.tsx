import { cn } from "@/lib/utils"
import { BRAND } from "./brand"

/**
 * Leadersheet mark: a sheet with a dog-eared corner in signal pink and one
 * line run through the lime highlighter. The cheat sheet, marked up.
 */
export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-7 shrink-0", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path d="M7 2.5h13.8L28 9.7V26a3.5 3.5 0 0 1-3.5 3.5H7A3.5 3.5 0 0 1 3.5 26V6A3.5 3.5 0 0 1 7 2.5z" fill="currentColor" />
      <path d="M20.8 2.5v5.2a2 2 0 0 0 2 2H28z" fill="var(--signal)" />
      <rect x="7.5" y="13" width="14" height="5.5" rx="1.2" fill="var(--signal-2)" />
      <rect x="7.5" y="21.6" width="10" height="2.6" rx="1.3" fill="var(--background)" />
    </svg>
  )
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className="text-[17px] font-bold tracking-[-0.025em]">
          Leader<span className="font-medium">sheet</span>
        </span>
        <span className="label-mono mt-1 hidden !text-[9.5px] !leading-none whitespace-nowrap sm:block">{BRAND.descriptor}</span>
      </span>
    </span>
  )
}
