"use client"

import NumberFlow from "@number-flow/react"

/**
 * A number that rolls digit by digit when it changes. Static under reduced motion.
 * The rolling digits live in a shadow root that copy, search, page readers and some screen readers
 * skip, so the same number also sits beside it as plain text, read in their place.
 */
export function Num({
  value,
  decimals = 0,
  prefix,
  suffix,
  pad,
  className,
}: {
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  pad?: number
  className?: string
}) {
  const format = { minimumFractionDigits: decimals, maximumFractionDigits: decimals, minimumIntegerDigits: pad, useGrouping: false }
  return (
    <>
      <NumberFlow aria-hidden value={value} prefix={prefix} suffix={suffix} className={className} format={format} willChange />
      <span className="sr-only">{`${prefix ?? ""}${new Intl.NumberFormat("en", format).format(value)}${suffix ?? ""}`}</span>
    </>
  )
}
