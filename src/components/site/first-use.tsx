"use client"

import * as React from "react"
import { track } from "@vercel/analytics"
import { useProgress } from "@/lib/store"

/**
 * Sends one Vercel custom event the first time a visitor clicks or presses a key inside the wrapped
 * piece (a lab, a game), and counts every day it is used toward the streak. Two properties at most, which is the Pro plan's limit.
 */
export function FirstUse({ event, props, children }: { event: string; props: Record<string, string>; children: React.ReactNode }) {
  const { touch } = useProgress()
  const sent = React.useRef(false)
  const once = () => {
    // Every interaction marks today, so a page left open overnight still counts the next day.
    // touch() changes nothing once today is recorded, so this costs no re-render.
    touch()
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
