"use client"

import * as React from "react"
import { Check as CheckIcon, X } from "lucide-react"
import { type Check, seededOrder } from "@/data/course"
import { cn } from "@/lib/utils"

/** One multiple-choice question. Order is seeded so it renders the same on server and client. */
export function Question({
  q,
  qid,
  onAnswer,
  index,
}: {
  q: Check
  qid: string
  onAnswer?: (ok: boolean) => void
  index?: number
}) {
  const [picked, setPicked] = React.useState<number | null>(null)
  const order = React.useMemo(() => seededOrder(q.o.length, qid), [q.o.length, qid])
  const done = picked !== null
  const ok = picked === q.a
  return (
    <fieldset className="grid gap-3">
      <legend className="mb-3 flex gap-3 text-[17px] leading-snug font-semibold">
        {index != null && <span className="font-mono text-xs leading-6 font-medium text-muted-foreground tnum">Q{index + 1}</span>}
        <span>{q.q}</span>
      </legend>
      <div className="grid gap-2">
        {order.map((i) => {
          const isRight = done && i === q.a
          const isWrong = done && i === picked && !ok
          return (
            <button
              key={i}
              type="button"
              disabled={done}
              onClick={() => {
                setPicked(i)
                onAnswer?.(i === q.a)
              }}
              className={cn(
                "flex min-h-11 w-full items-center gap-3 rounded-md border border-border bg-card px-4 py-2.5 text-left text-[15px] transition-[border-color,background-color] duration-(--dur-ui)",
                !done && "hover:border-foreground/50",
                isRight && "border-ok bg-ok/8 text-foreground",
                isWrong && "text-muted-foreground line-through decoration-1",
                done && !isRight && !isWrong && "opacity-55"
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-full border border-rule/70",
                  isRight && "border-ok bg-ok text-background",
                  isWrong && "border-foreground/40"
                )}
              >
                {isRight && <CheckIcon className="size-3" strokeWidth={3} />}
                {isWrong && <X className="size-3" strokeWidth={3} />}
              </span>
              <span>{q.o[i]}</span>
              {isRight && <span className="sr-only">, correct answer</span>}
              {isWrong && <span className="sr-only">, your answer, incorrect</span>}
            </button>
          )
        })}
      </div>
      <p role="status" className={cn("text-sm text-muted-foreground", !done && "sr-only")}>
        {done && (
          <>
            <b className={cn("font-semibold", ok ? "text-ok" : "text-foreground")}>{ok ? "Right." : "Not quite."}</b>{" "}
            {q.why}
          </>
        )}
      </p>
    </fieldset>
  )
}
