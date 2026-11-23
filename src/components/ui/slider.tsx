"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Slider as SliderPrimitive } from "@base-ui/react/slider"

/**
 * Base UI's slider. Values in and out are arrays, one per thumb, as callers had them. Each thumb holds a native range
 * input, so keys, screen readers and forms come with it; the ring shows when that input has keyboard focus.
 */
function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  thumbLabel,
  onValueChange,
  ...props
}: Omit<SliderPrimitive.Root.Props, "value" | "defaultValue" | "onValueChange"> & {
  value?: number[]
  defaultValue?: number[]
  onValueChange?: (value: number[]) => void
  thumbLabel?: string
}) {
  const thumbs = (value ?? defaultValue ?? [min]).length
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      value={value}
      defaultValue={defaultValue}
      min={min}
      max={max}
      onValueChange={(v) => onValueChange?.(Array.isArray(v) ? [...v] : [v])}
      className={cn("relative w-full data-disabled:opacity-50", className)}
      {...props}
    >
      <SliderPrimitive.Control className="relative flex h-11 w-full touch-none items-center select-none">
        <SliderPrimitive.Track data-slot="slider-track" className="relative h-1.5 w-full grow rounded-full bg-border select-none">
          <SliderPrimitive.Indicator data-slot="slider-range" className="rounded-full bg-foreground select-none" />
          {Array.from({ length: thumbs }, (_, index) => (
            <SliderPrimitive.Thumb
              data-slot="slider-thumb"
              key={index}
              index={thumbs > 1 ? index : undefined}
              aria-label={thumbLabel}
              className="block size-5 shrink-0 rounded-full border-2 border-foreground bg-card ring-signal/30 transition-[color,box-shadow] select-none after:absolute after:-inset-3 hover:ring-3 active:ring-3 has-[:focus-visible]:ring-3 data-disabled:pointer-events-none"
            />
          ))}
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider }
