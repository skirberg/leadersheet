"use client"

import NumberFlow from "@number-flow/react"

/** A number that rolls digit by digit when it changes. Static under reduced motion. */
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
  return (
    <NumberFlow
      value={value}
      prefix={prefix}
      suffix={suffix}
      className={className}
      format={{ minimumFractionDigits: decimals, maximumFractionDigits: decimals, minimumIntegerDigits: pad, useGrouping: false }}
      willChange
    />
  )
}
