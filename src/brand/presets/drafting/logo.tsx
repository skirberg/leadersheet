import { cn } from "@/lib/utils"

/**
 * The mark: a sandbox frame (registration corners) around a leader node
 * in red pencil and two ink nodes it is connected to. Leader as architect.
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
      <path
        d="M3 9.5V3h6.5M22.5 3H29v6.5M29 22.5V29h-6.5M9.5 29H3v-6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
      />
      <path
        d="M16 13.2v3.3h-5.5v2.3M16 16.5h5.5v2.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="10.2" r="3.1" fill="var(--signal)" />
      <circle cx="10.5" cy="21.6" r="2.7" fill="currentColor" />
      <circle cx="21.5" cy="21.6" r="2.7" fill="currentColor" />
    </svg>
  )
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className="text-[15px] font-semibold tracking-[-0.01em]">Leadership Sandbox</span>
        <span className="label-mono mt-1 !text-[9.5px] !leading-none !normal-case">LiO · 12 sheets</span>
      </span>
    </span>
  )
}
