"use client"

import { ViewTransition } from "react"
import { usePathname } from "next/navigation"

/*
  A page change crossfades: the old page leaves and the new one arrives at the interface speed (globals.css, "Page
  changes"), on the browser's View Transitions API through React's <ViewTransition>. Keyed by the path, so only a move
  to another page animates: `default="none"` keeps every other update still, such as the motion engine arriving after
  hydration or a game moving to its next step, which would otherwise crossfade too and hold taps for the length of it.
  Where the API is missing the page swaps at once, as before.
*/
export function PageTransition({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  return (
    <ViewTransition key={path} enter="auto" exit="auto" default="none">
      {children}
    </ViewTransition>
  )
}
