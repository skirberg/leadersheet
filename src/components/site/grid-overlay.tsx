"use client"

import * as React from "react"

/*
  `?grid` on any address draws the page grid over the page: the frame's columns as tinted bands, so anything off a
  column line shows at a glance (base-ui.com's construction, made visible). The bands are the same `page` grid every
  page uses, so they cannot disagree with it. Nothing renders without the parameter.
*/
const subscribe = (changed: () => void) => {
  window.addEventListener("popstate", changed)
  return () => window.removeEventListener("popstate", changed)
}

export function GridOverlay() {
  // read from the address, and off while the server renders
  const on = React.useSyncExternalStore(subscribe, () => new URLSearchParams(location.search).has("grid"), () => false)
  if (!on) return null
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100] print:hidden" data-grid-overlay>
      <div className="page h-full !pt-0 [&>*:nth-child(n+5)]:hidden sm:[&>*:nth-child(n+5)]:block sm:[&>*:nth-child(n+9)]:hidden lg:[&>*:nth-child(n+9)]:block">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="h-dvh bg-destructive/7 outline outline-1 -outline-offset-1 outline-destructive/25" />
        ))}
      </div>
    </div>
  )
}
