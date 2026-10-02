import { BRAND } from "@/brand"
import { cn } from "@/lib/utils"

/**
 * The brand's emphasis device on a phrase. Set per brand in src/brand:
 * "underline" draws a hand-made stroke under it, "highlight" swipes a highlighter behind it.
 * Draws once on entry; appears already drawn under reduced motion.
 */
export function Emphasis({ children, className, delay = 250 }: { children: React.ReactNode; className?: string; delay?: number }) {
  if (BRAND.emphasis === "highlight") {
    return (
      <span className={cn("relative inline whitespace-nowrap", className)}>
        <span
          aria-hidden
          className="highlight-swipe absolute -inset-x-[0.1em] top-[0.26em] bottom-[0.02em] -z-0 rounded-[0.08em] bg-signal-2"
          style={{ ["--delay" as string]: `${delay}ms` }}
        />
        <span className="relative text-signal-2-foreground">{children}</span>
      </span>
    )
  }
  return (
    <span className={cn("relative inline whitespace-nowrap", className)}>
      {children}
      <svg
        aria-hidden
        viewBox="0 0 300 14"
        preserveAspectRatio="none"
        className="pointer-events-none absolute -bottom-[0.18em] left-[-2%] h-[0.32em] w-[104%] overflow-visible"
      >
        <path
          className="signal-stroke"
          pathLength={1}
          style={{ ["--len" as string]: 1, ["--delay" as string]: `${delay}ms`, strokeWidth: 3.2 }}
          vectorEffect="non-scaling-stroke"
          d="M3 9.5C46 5 92 11 141 6.8S236 5.2 297 7.5"
        />
      </svg>
    </span>
  )
}
