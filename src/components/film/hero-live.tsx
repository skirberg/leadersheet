"use client"

import * as React from "react"
import { Pause, Play } from "lucide-react"
import { STRUCTURES } from "@/data/labs"
import { HERO_KINDS, HeroScene, weightsAt } from "./hero-scene"

/*
  The home hero you can move. One drawing, driven by the visitor:
  drag sideways anywhere on the sheet, or tap a structure, and the organization redraws.
  On load it draws itself and walks through the four structures once, then waits.
*/

const CELLS = [222, 474, 726, 978] // label centres along the rail, in drawing units
const CELL_W = 252
const RAIL_Y = 120
const NAMES = HERO_KINDS.map((k) => (k === "flat" ? "Flat" : STRUCTURES[k].name))
const labelW = (n: string) => n.length * 17.5 + 44

// One clock for the opening: the drawing builds for 3 s, then a single tour, then it stops.
const TOUR: [ms: number, t: number][] = [
  [3000, 0],
  [4400, 0],
  [5100, 1],
  [6600, 1],
  [7300, 2],
  [8800, 2],
  [9500, 3],
  [11000, 3],
  [11900, 0],
]
const TOUR_END = TOUR[TOUR.length - 1][0]
const smooth = (u: number) => u * u * (3 - 2 * u)
function tourAt(ms: number) {
  for (let i = 1; i < TOUR.length; i++) {
    const [m1, t1] = TOUR[i]
    const [m0, t0] = TOUR[i - 1]
    if (ms <= m1) return t0 + (t1 - t0) * smooth(Math.max(0, (ms - m0) / (m1 - m0)))
  }
  return 0
}
const lerp = (a: number, b: number, u: number) => a + (b - a) * u
function along(values: number[], t: number) {
  const i = Math.min(values.length - 2, Math.floor(t))
  return lerp(values[i], values[i + 1], t - i)
}

export default function HeroLive({ rm }: { rm: boolean }) {
  const [t, setT] = React.useState(0)
  const [f, setF] = React.useState(rm ? 100 : 0)
  const [paused, setPaused] = React.useState(false)
  const [touched, setTouched] = React.useState(false)
  const [tourDone, setTourDone] = React.useState(rm)
  const svgRef = React.useRef<SVGSVGElement>(null)
  const tRef = React.useRef(0)
  tRef.current = t
  const tween = React.useRef<number | null>(null)
  const clock = React.useRef(0)

  // The opening clock: advances only while on screen, not paused and not yet taken over.
  const visible = React.useRef(true)
  React.useEffect(() => {
    const node = svgRef.current
    if (!node) return
    const io = new IntersectionObserver(([e]) => (visible.current = e.isIntersecting))
    io.observe(node)
    return () => io.disconnect()
  }, [])
  React.useEffect(() => {
    if (rm || touched || paused || tourDone) return
    let raf = 0
    let last = performance.now()
    let ms = clock.current
    const step = (now: number) => {
      const dt = Math.min(64, now - last)
      last = now
      if (visible.current) ms += dt
      clock.current = ms
      setF(Math.min(100, (ms / 1000) * 30))
      if (ms >= 3000) setT(tourAt(ms))
      if (ms >= TOUR_END) {
        setT(0)
        setTourDone(true)
        return
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [rm, touched, paused, tourDone])

  React.useEffect(() => {
    if (rm) {
      setF(100)
      setTourDone(true)
    }
  }, [rm])

  const takeOver = () => {
    setTouched(true)
    setF(100)
  }

  const animateTo = React.useCallback(
    (target: number) => {
      if (tween.current) cancelAnimationFrame(tween.current)
      const from = tRef.current
      if (rm || Math.abs(target - from) < 0.001) {
        setT(target)
        return
      }
      const start = performance.now()
      const dur = 260 + 220 * Math.min(3, Math.abs(target - from))
      const step = (now: number) => {
        const u = Math.min(1, (now - start) / dur)
        setT(from + (target - from) * smooth(u))
        if (u < 1) tween.current = requestAnimationFrame(step)
      }
      tween.current = requestAnimationFrame(step)
    },
    [rm],
  )

  // Drag sideways anywhere on the sheet; a tap on a structure jumps to it.
  const drag = React.useRef<{ x: number; t0: number; px: number; moved: boolean } | null>(null)
  const toDrawing = (clientX: number, clientY: number) => {
    const r = svgRef.current!.getBoundingClientRect()
    return [((clientX - r.left) / r.width) * 1200, ((clientY - r.top) / r.height) * 900, 1200 / r.width]
  }
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    takeOver()
    if (tween.current) cancelAnimationFrame(tween.current)
    const [, , scale] = toDrawing(e.clientX, e.clientY)
    drag.current = { x: e.clientX, t0: tRef.current, px: CELL_W / scale, moved: false }
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.x
    if (Math.abs(dx) > 4) d.moved = true
    if (d.moved) setT(Math.min(3, Math.max(0, d.t0 + dx / d.px)))
  }
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current
    drag.current = null
    if (!d) return
    if (d.moved) return animateTo(Math.round(tRef.current))
    const [x] = toDrawing(e.clientX, e.clientY)
    const nearest = CELLS.reduce((b, c, i) => (Math.abs(c - x) < Math.abs(CELLS[b] - x) ? i : b), 0)
    // A tap on the rail picks that structure; a tap on the drawing moves one step on.
    const [, y] = toDrawing(e.clientX, e.clientY)
    animateTo(y < 240 ? nearest : (Math.round(tRef.current) + 1) % 4)
  }

  const w = weightsAt(t)
  const near = Math.round(t)
  const cap = Math.max(0, 1 - Math.abs(t - near) * 2.5)
  const thumbX = along(CELLS, t)
  const thumbW = along(NAMES.map(labelW), t)
  const thumbD = `M${thumbX - thumbW / 2 - 4} ${RAIL_Y - 32}H${thumbX + thumbW / 2 + 4}A25 25 0 0 1 ${thumbX + thumbW / 2 + 4} ${RAIL_Y + 18}H${thumbX - thumbW / 2 - 4}A25 25 0 0 1 ${thumbX - thumbW / 2 - 4} ${RAIL_Y - 32}Z`
  const showPause = !rm && !touched && !tourDone

  return (
    <div className="group/hero relative h-full w-full has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-ring">
      <svg
        ref={svgRef}
        viewBox="0 0 1200 900"
        className="block h-full w-full cursor-ew-resize touch-pan-y select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (drag.current = null)}
        aria-hidden
      >
        <HeroScene f={f} w={w} cap={cap} plain>
          <g opacity={Math.min(1, Math.max(0, (f - 10) / 20))}>
            {/* the structure in focus sits in a black pill; its word turns white where the pill covers it. */}
            <defs>
              <clipPath id="hl-clip">
                <path d={thumbD} />
              </clipPath>
            </defs>
            <path d={thumbD} fill="var(--foreground)" strokeLinejoin="round" stroke="var(--foreground)" strokeWidth={6} />
            {[false, true].map((ink) => (
              <g key={String(ink)} clipPath={ink ? "url(#hl-clip)" : undefined}>
                {NAMES.map((n, i) => (
                  <text
                    key={n}
                    x={CELLS[i]}
                    y={RAIL_Y + 4}
                    textAnchor="middle"
                    style={{ font: `600 34px var(--font-funnel-display), system-ui, sans-serif` }}
                    fill={ink ? "var(--background)" : "var(--muted-foreground)"}
                  >
                    {n}
                  </text>
                ))}
              </g>
            ))}
          </g>
        </HeroScene>
      </svg>

      {/* The keyboard and screen reader way in: a real slider over the same four stops. */}
      <label className="sr-only">
        Organization structure
        <input
          type="range"
          min={0}
          max={3}
          step={1}
          value={near}
          aria-valuetext={`${STRUCTURES[HERO_KINDS[near]].name}. ${STRUCTURES[HERO_KINDS[near]].why}`}
          onChange={(e) => {
            takeOver()
            animateTo(Number(e.target.value))
          }}
        />
      </label>

      {showPause && (
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "Play the tour of the four structures" : "Pause the tour of the four structures"}
          aria-pressed={paused}
          className="absolute top-2 right-2 grid size-9 place-items-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
        </button>
      )}
    </div>
  )
}
