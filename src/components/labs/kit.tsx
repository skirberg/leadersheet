"use client"

import * as React from "react"
import { Check as CheckIcon, X } from "lucide-react"
import { ToggleGroup } from "@base-ui/react/toggle-group"
import { Toggle } from "@base-ui/react/toggle"
import { m } from "framer-motion"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

export function LabFrame({
  code,
  title,
  children,
  note,
  className,
}: {
  code: string
  title: string
  children: React.ReactNode
  note?: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn("@container min-w-0 rounded-2xl bg-card", className)}>
      <header className="px-5 pt-5 @xl:px-6 @xl:pt-6" data-lab={code}>
        <h3 className="text-xl leading-snug font-semibold tracking-[-0.01em]">{title}</h3>
      </header>
      <div className="grid gap-5 p-5 @xl:p-6">{children}</div>
      {note && <p className="px-5 pb-5 text-sm text-muted-foreground @xl:px-6">{note}</p>}
    </section>
  )
}

/** Single-choice segmented control on Base UI's ToggleGroup: arrow keys move, one option pressed at a time. */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: React.ReactNode }[]
  label: string
  className?: string
}) {
  const pill = React.useId()
  return (
    <ToggleGroup
      value={[value]}
      // a tap on the pressed option would empty the group; a segmented control always has one
      onValueChange={(v) => v[0] && onChange(v[0] as T)}
      aria-label={label}
      className={cn("inline-flex max-w-full flex-wrap rounded-md border border-border bg-muted p-1", className)}
    >
      {options.map((o) => (
        <Toggle
          key={o.value}
          value={o.value}
          className="relative min-h-11 rounded-[4px] px-3 text-sm text-muted-foreground transition-colors duration-(--dur-ui) hover:text-foreground data-pressed:font-semibold data-pressed:text-foreground"
        >
          {/* Like the mode pill: while it slides it must not take the next option's click. */}
          {value === o.value && <m.span layoutId={pill} className="pointer-events-none absolute inset-0 rounded-[4px] bg-card shadow-[0_0_0_1px_var(--rule)]" />}
          <span className="relative">{o.label}</span>
        </Toggle>
      ))}
    </ToggleGroup>
  )
}

export function Meter({ label, value, max, suffix }: { label: string; value: number; max: number; suffix?: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,10rem)_minmax(0,1fr)_3.5rem] items-center gap-3 text-sm">
      <span className="truncate">{label}</span>
      <div className="h-2 overflow-hidden rounded-full bg-border" role="img" aria-label={`${label}: ${value} of ${max}`}>
        <div
          className="h-full rounded-full bg-foreground transition-transform duration-(--dur-draw) ease-(--ease-draft)"
          style={{ transform: `translateX(${(value / max) * 100 - 100}%)` }}
        />
      </div>
      <span className="text-right font-mono text-sm font-medium tnum">{suffix ?? `${value}/${max}`}</span>
    </div>
  )
}

export function RangeField({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format,
  ariaLabel,
}: {
  id: string
  label: string
  ariaLabel?: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  format?: (v: number) => string
}) {
  return (
    <div className="grid gap-0.5">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <label id={`${id}-l`} className="text-muted-foreground">
          {label}
        </label>
        <span className="font-mono text-sm font-medium tnum">{format ? format(value) : value}</span>
      </div>
      <Slider
        thumbLabel={ariaLabel ?? label}
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0])}
      />
    </div>
  )
}

export function CheckRow({
  id,
  checked,
  onChange,
  children,
}: {
  id: string
  checked: boolean
  onChange: (v: boolean) => void
  children: React.ReactNode
}) {
  // Base UI's checkbox is a span, which a <label> does not name; Base UI links the two only once the page's code runs.
  // Naming it here puts the name in the page as sent, so a slow phone's screen reader never meets an unnamed box.
  return (
    <label htmlFor={id} className="flex min-h-11 cursor-pointer items-start gap-3 py-2 text-base leading-snug">
      <Checkbox id={id} aria-labelledby={`${id}-label`} checked={checked} onCheckedChange={(v) => onChange(v === true)} />
      <span id={`${id}-label`}>{children}</span>
    </label>
  )
}

/** Sort statements into buckets. One tap per item, then it locks and shows right or wrong. */
export function Sorter({
  items,
  buckets,
  hint,
}: {
  items: [string, string][]
  buckets: { key: string; label: string }[]
  hint: string
}) {
  const [picks, setPicks] = React.useState<Record<number, string>>({})
  const done = Object.keys(picks).length
  const right = items.filter((it, i) => picks[i] === it[1]).length
  return (
    <div className="grid gap-3">
      <ol className="grid gap-2">
        {items.map((it, i) => {
          const p = picks[i]
          const ok = p === it[1]
          return (
            <li
              key={i}
              className={cn(
                "grid gap-3 rounded-lg bg-background p-3 ring-1 ring-transparent transition-colors duration-(--dur-ui)",
                // With many buckets the choices sit under the statement, so the statement keeps a readable width.
                buckets.length <= 4 && "@xl:grid-cols-[minmax(0,1fr)_auto] @xl:items-center",
                p && ok && "ring-ok/70",
                p && !ok && "ring-foreground/30"
              )}
            >
              <p className="flex items-start gap-2 text-base">
                {p && (ok ? <CheckIcon className="mt-0.5 size-4 shrink-0 text-ok" strokeWidth={3} aria-label="Right" /> : <X className="mt-0.5 size-4 shrink-0" strokeWidth={3} aria-label="Not quite" />)}
                <span>{it[0]}</span>
              </p>
              <div className="flex flex-wrap gap-1.5" role="group" aria-label={`Sort: ${it[0]}`}>
                {buckets.map((b) => {
                  const chosen = p === b.key
                  const isAnswer = p && b.key === it[1]
                  return (
                    <button
                      key={b.key}
                      type="button"
                      disabled={!!p}
                      onClick={() => setPicks((s) => ({ ...s, [i]: b.key }))}
                      className={cn(
                        "min-h-11 flex-1 rounded-[4px] border border-border bg-card px-3 text-sm font-medium press disabled:active:scale-100 @xl:flex-none",
                        !p && "hover:border-foreground/60",
                        chosen && !ok && "line-through opacity-70",
                        isAnswer && "border-ok bg-ok text-background",
                        p && !chosen && !isAnswer && "opacity-40"
                      )}
                    >
                      {b.label}
                    </button>
                  )
                })}
              </div>
            </li>
          )
        })}
      </ol>
      <p role="status" className="text-base">
        {done === items.length && (
          <b className="font-mono text-sm font-semibold text-foreground tnum">
            {right} of {items.length} right.{" "}
          </b>
        )}
        {hint}
        {done > 0 && done < items.length && (
          <button type="button" className="ml-2 inline-flex min-h-11 items-center font-medium text-foreground underline underline-offset-4 hover:text-muted-foreground" onClick={() => setPicks({})}>
            Reset
          </button>
        )}
        {done === items.length && (
          <button type="button" className="ml-2 inline-flex min-h-11 items-center font-medium text-foreground underline underline-offset-4 hover:text-muted-foreground" onClick={() => setPicks({})}>
            Try again
          </button>
        )}
      </p>
    </div>
  )
}

/** A short callout that changes with the lab state. */
export function Readout({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div role="status" className={cn("feedback text-base", className)}>
      {children}
    </div>
  )
}
