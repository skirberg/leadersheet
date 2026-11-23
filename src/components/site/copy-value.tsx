"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"

/** A colour value you can tap to copy. Says "Copied" for a moment; the value stays selectable when the clipboard is refused. */
export function CopyValue({ value, label, className }: { value: string; label: string; className?: string }) {
  const [done, setDone] = React.useState(false)
  return (
    <button
      type="button"
      aria-label={`Copy ${label} ${value}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value)
          setDone(true)
          setTimeout(() => setDone(false), 1400)
        } catch {}
      }}
      className={cn(
        "group inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 font-mono text-sm tnum text-foreground transition-colors select-text hover:bg-muted",
        className
      )}
    >
      {value}
      {done ? <Check className="size-3.5" /> : <Copy className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />}
      <span className="sr-only" role="status">
        {done ? "Copied" : ""}
      </span>
    </button>
  )
}
