"use client"

import { MotionConfig } from "motion/react"

/* One spring for every Motion animation on the site; honors the system reduced-motion setting. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 520, damping: 42, mass: 0.7 }}>
      {children}
    </MotionConfig>
  )
}
