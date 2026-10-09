"use client"

import * as React from "react"
import { track } from "@vercel/analytics"

/**
 * Sends one Vercel custom event the first time a visitor clicks or presses a key inside the wrapped
 * piece (a lab, a game). Two properties at most, which is the Pro plan's limit.
 */
export function FirstUse({ event, props, children }: { event: string; props: Record<string, string>; children: React.ReactNode }) {
  const sent = React.useRef(false)
  const once = () => {
    if (sent.current) return
    sent.current = true
    track(event, props)
  }
  return (
    <div onPointerDownCapture={once} onKeyDownCapture={once} className="contents">
      {children}
    </div>
  )
}
