"use client"

import { LazyMotion, MotionConfig } from "framer-motion"

// The layout animation engine loads after the page is interactive; until then the indicators sit still where they belong.
const features = () => import("./features").then((m) => m.default)

/*
  One spring for every Motion animation on the site; honors the system reduced-motion setting.
  Components use `m.*` from "framer-motion" (`strict` turns a full `motion.*` into an error). Import Motion from
  "framer-motion", not "motion/react": that entry re-exports the whole library through a namespace, so every page would ship all of it.
*/
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={features} strict>
      <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 520, damping: 42, mass: 0.7 }}>
        {children}
      </MotionConfig>
    </LazyMotion>
  )
}
