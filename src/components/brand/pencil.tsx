import { cn } from "@/lib/utils"

/** Device 2: a red pencil stroke under a phrase. Draws once on entry. */
export function PencilUnderline({
  children,
  className,
  delay = 250,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
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
          className="pencil-stroke"
          pathLength={1}
          style={{ ["--len" as string]: 1, ["--delay" as string]: `${delay}ms`, strokeWidth: 3.2 }}
          vectorEffect="non-scaling-stroke"
          d="M3 9.5C46 5 92 11 141 6.8S236 5.2 297 7.5"
        />
      </svg>
    </span>
  )
}

/** A loose pencil loop around a word or a number. */
export function PencilCircle({
  children,
  className,
  delay = 300,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  return (
    <span className={cn("relative inline-block", className)}>
      {children}
      <svg
        aria-hidden
        viewBox="0 0 200 64"
        preserveAspectRatio="none"
        className="pointer-events-none absolute -inset-x-[14%] -inset-y-[34%] h-[168%] w-[128%] overflow-visible"
      >
        <path
          className="pencil-stroke"
          pathLength={1}
          style={{ ["--len" as string]: 1, ["--delay" as string]: `${delay}ms`, strokeWidth: 2.4 }}
          vectorEffect="non-scaling-stroke"
          d="M118 7C64 2 9 13 6 33c-3 20 62 27 116 23 52-4 76-15 73-30C192 10 150 3 92 9"
        />
      </svg>
    </span>
  )
}
