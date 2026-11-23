"use client"

import * as React from "react"
import Link from "next/link"
import { track } from "@vercel/analytics"
import { ArrowLeft, ArrowRight, ChevronDown, Lock, Plus, RotateCcw, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Num } from "@/components/motion/number"
import { lessonPath, sessionById } from "@/data/course"
import { BURT_MEAN, BURT_SD, burtBand, constraint, dropContact, emptyTies, groups, withOneMore, type Ties } from "@/lib/network"
import { useProgress } from "@/lib/store"
import { Disclaimer, GameShell, ProgressLine } from "./games"
import { ShareResult } from "./share"

/*
  Map your network: name the people you talk work through with, mark who knows whom, and see your network constraint,
  Burt's measure of how closed the circle is (src/lib/network.ts). One step per screen, the map drawing itself as you
  answer. Names stay in this browser; nothing is sent, and analytics get the count and the score, never a name.
*/

const MIN = 3
const MAX = 10
type Saved = { names: string[]; pairs: [number, number][] }

const toPairs = (t: Ties) => t.flatMap((row, a) => row.flatMap((on, b) => (on && a < b ? [[a, b] as [number, number]] : [])))
const fromPairs = (n: number, pairs: [number, number][]) => {
  const t = emptyTies(n)
  for (const [a, b] of pairs) if (a < n && b < n) t[a][b] = t[b][a] = true
  return t
}

/** The map: you in the middle, your contacts round you, a line wherever two of them know each other. */
export function MapDrawing({ names, ties, order, strong, label }: { names: string[]; ties: Ties; order?: number[]; strong?: number; label: string }) {
  const n = names.length
  const seq = order ?? names.map((_, i) => i)
  const pos = new Map(seq.map((who, k) => {
    const a = -Math.PI / 2 + (2 * Math.PI * k) / Math.max(n, 1)
    return [who, { x: 180 + 104 * Math.cos(a), y: 150 + 104 * Math.sin(a), a }]
  }))
  const short = (s: string) => (s.length > 12 ? `${s.slice(0, 11)}…` : s)
  return (
    <svg viewBox="0 0 360 300" className="viz w-full max-w-[460px]" role="img" aria-label={label}>
      {names.map((_, j) => {
        const p = pos.get(j)!
        return <line key={`e${j}`} x1={180} y1={150} x2={p.x} y2={p.y} className="grid-line" />
      })}
      {names.flatMap((_, a) =>
        names.map((__, b) => {
          if (!(a < b && ties[a]?.[b])) return null
          const p = pos.get(a)!, q = pos.get(b)!
          return <line key={`t${a}-${b}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} className="edge-ink" strokeWidth={1.6} />
        })
      )}
      <circle cx={180} cy={150} r={16} className="fill-signal" />
      <text x={180} y={153.5} textAnchor="middle" style={{ fill: "var(--signal-foreground)", fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 9 }}>
        You
      </text>
      {names.map((name, j) => {
        const p = pos.get(j)!
        const lx = 180 + 136 * Math.cos(p.a), ly = 150 + 136 * Math.sin(p.a)
        const anchor = Math.abs(Math.cos(p.a)) < 0.3 ? "middle" : Math.cos(p.a) > 0 ? "start" : "end"
        return (
          <g key={`n${j}`}>
            <circle cx={p.x} cy={p.y} r={9} className={j === strong ? "fill-ink" : "node"} />
            <text x={lx} y={ly + 4} textAnchor={anchor} className="lbl">
              {short(name)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function NetworkMap() {
  const { lab, ready } = useProgress()
  if (!ready) return <div className="min-h-[520px] rounded-2xl bg-card" aria-busy="true" />
  // mounted once progress has loaded, so a saved map starts on its result without a second render
  return <NetworkSteps saved={lab<Saved | null>("g-network", null)} />
}

function NetworkSteps({ saved }: { saved: Saved | null }) {
  const { setLab, patchLab, touch } = useProgress()
  const has = !!saved && saved.names?.length >= MIN
  const [stage, setStage] = React.useState<"intro" | "names" | "ties" | "result">(has ? "result" : "intro")
  const [names, setNames] = React.useState<string[]>(has ? saved!.names : [])
  const [draft, setDraft] = React.useState("")
  const [ties, setTies] = React.useState<Ties>(() => (has ? fromPairs(saved!.names.length, saved!.pairs ?? []) : []))
  const [k, setK] = React.useState(0)
  const input = React.useRef<HTMLInputElement>(null)
  const heading = React.useRef<HTMLParagraphElement>(null)

  const add = () => {
    const v = draft.trim().slice(0, 24)
    if (!v || names.length >= MAX) return
    setNames([...names, names.includes(v) ? `${v} ${names.filter((x) => x.startsWith(v)).length + 1}` : v])
    setDraft("")
    input.current?.focus()
  }
  // a removed contact takes their ties with them, so the others keep theirs (found in review: they used to shift by one)
  const remove = (i: number) => {
    setNames(names.filter((_, j) => j !== i))
    setTies((t) => dropContact(t, i))
  }
  const toggle = (a: number, b: number) =>
    setTies((t) => t.map((row, x) => row.map((on, y) => ((x === a && y === b) || (x === b && y === a) ? !on : on))))
  const toTies = () => {
    // keep any ties already marked between people still on the list
    const old = ties
    setTies(Array.from({ length: names.length }, (_, a) => Array.from({ length: names.length }, (_, b) => !!old[a]?.[b])))
    setK(0)
    setStage("ties")
  }
  const finish = () => {
    setLab("g-network", { names, pairs: toPairs(ties) } satisfies Saved)
    touch()
    track("Network mapped", { contacts: names.length, constraint: Math.round(constraint(ties).total * 100) })
    setStage("result")
  }
  const focusHeading = () => requestAnimationFrame(() => heading.current?.focus())

  if (stage === "intro")
    return (
      <GameShell kind="Map · 4 min" title="Map your network">
        <p className="max-w-[52ch] text-lg">
          Name the people you talk work through with, mark who knows whom, and see how closed your circle is: <b className="font-semibold">network constraint</b>, Burt&apos;s measure of how much your contacts all know each other.
        </p>
        <MapDrawing names={["", "", "", "", ""]} ties={fromPairs(5, [[0, 1], [1, 2], [3, 4]])} label="What you get: your contacts drawn round you, with a line wherever two of them know each other" />
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <Button size="lg" onClick={() => (setStage("names"), requestAnimationFrame(() => input.current?.focus()))}>
            Start <ArrowRight className="size-4" />
          </Button>
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Lock aria-hidden className="size-3.5" /> Names stay in this browser
          </span>
        </div>
        <Disclaimer>Network constraint from Ronald Burt, Structural Holes (1992), computed as in his worked example. First names or initials are enough.</Disclaimer>
      </GameShell>
    )

  if (stage === "names")
    return (
      <GameShell kind="Step 1 of 2" title="Map your network">
        <div className="grid gap-2">
          <p className="t-question">Over the last six months, who have you gone to when something at work needed thinking through?</p>
          <p className="text-base">
            Three to ten people, at work or outside it. First names or initials.
          </p>
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            add()
          }}
        >
          <label htmlFor="net-name" className="sr-only">
            A name
          </label>
          <input
            id="net-name"
            ref={input}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={24}
            autoComplete="off"
            disabled={names.length >= MAX}
            placeholder={names.length >= MAX ? "Ten is the most" : "A name"}
            className="min-h-12 min-w-0 flex-1 rounded-[14px] border border-border bg-card px-4 text-base outline-none focus-visible:border-foreground"
          />
          <Button type="submit" size="lg" variant="outline" disabled={!draft.trim() || names.length >= MAX}>
            <Plus className="size-4" /> Add
          </Button>
        </form>
        {names.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="People on your map">
            {names.map((name, i) => (
              <li key={`${name}-${i}`} className="chip gap-1 pr-1">
                {name}
                <button type="button" onClick={() => remove(i)} className="-my-1 grid size-11 place-items-center rounded-full hover:bg-muted" aria-label={`Remove ${name}`}>
                  <X className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" onClick={() => setStage("intro")}>
            <ArrowLeft className="size-4" /> Back
          </Button>
          <Button size="lg" onClick={toTies} disabled={names.length < MIN}>
            {names.length < MIN ? `Add ${MIN - names.length} more` : "Next: who knows whom"} <ArrowRight className="size-4" />
          </Button>
        </div>
      </GameShell>
    )

  if (stage === "ties") {
    const n = names.length
    const steps = n - 1
    const others = names.map((_, j) => j).filter((j) => j > k)
    return (
      <GameShell kind="Step 2 of 2" title="Map your network">
        <ProgressLine value={k} max={steps} label="Who knows whom" />
        <MapDrawing names={names} ties={ties} label={`Your map so far: ${toPairs(ties).length} ties between your contacts`} />
        <div className="grid gap-3">
          <p ref={heading} tabIndex={-1} className="t-question outline-none" id="net-ask">
            Who here does {names[k]} know well enough to talk to without you?
          </p>
          <div role="group" aria-labelledby="net-ask" className="flex flex-wrap gap-2">
            {others.map((j) => (
              <button key={j} type="button" aria-pressed={ties[k][j]} onClick={() => toggle(k, j)} className="chip min-h-11 px-4 text-base aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background">
                {names[j]}
              </button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Nobody? Go on to the next person.</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" onClick={() => (k === 0 ? setStage("names") : (setK(k - 1), focusHeading()))}>
            <ArrowLeft className="size-4" /> Back
          </Button>
          {k + 1 < steps ? (
            <Button size="lg" onClick={() => (setK(k + 1), focusHeading())}>
              Next person <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button size="lg" onClick={finish}>
              See my network <ArrowRight className="size-4" />
            </Button>
          )}
        </div>
      </GameShell>
    )
  }

  // the result
  const { total, byContact } = constraint(ties)
  const c = Math.round(total * 100)
  const next = Math.round(withOneMore(ties) * 100)
  const gs = groups(ties)
  const order = gs.flat()
  const top = byContact.indexOf(Math.max(...byContact))
  const topShare = Math.round((byContact[top] / total) * 100)
  const band = burtBand(c)
  const at = (x: number) => `${Math.min(100, Math.max(0, x))}%`
  return (
    <GameShell title="Map your network">
      <div className="grid gap-3">
        <p className="label-mono">Network constraint</p>
        <p className="font-mono text-7xl leading-none font-medium tracking-tight tnum">
          <Num value={c} />
        </p>
        <p className="t-read">
          {band === "About average" ? "About average" : band === "More closed" ? "More closed than most" : "More open than most"} for Burt&apos;s managers, who averaged {BURT_MEAN} (standard deviation {BURT_SD}). Lower means more of your contacts sit in groups that do not talk to each other.
        </p>
        <p role="status" className="sr-only">
          Network constraint {c}. {band} for Burt&apos;s managers, who averaged {BURT_MEAN}.
        </p>
        <div aria-hidden className="relative mt-6 mb-5 h-2.5 max-w-[560px] rounded-full bg-border">
          <div className="absolute inset-y-0 left-0 rounded-full bg-foreground" style={{ width: at(c) }} />
          <div className="absolute -inset-y-1 w-0.5 rounded-full bg-muted-foreground" style={{ left: `calc(${at(BURT_MEAN)} - 1px)` }} />
          <span className="absolute -top-5 -translate-x-1/2 font-mono text-xs whitespace-nowrap text-muted-foreground tnum" style={{ left: at(BURT_MEAN) }}>
            Burt&apos;s average {Math.round(BURT_MEAN)}
          </span>
          <span className="absolute top-4 left-0 font-mono text-xs text-muted-foreground">0</span>
          <span className="absolute top-4 right-0 font-mono text-xs text-muted-foreground">100</span>
        </div>
      </div>

      <MapDrawing names={names} ties={ties} order={order} strong={top} label={`Your ${names.length} contacts in ${gs.length} ${gs.length === 1 ? "group" : "groups"}; ${names[top]} adds the most constraint`} />

      <ul className="grid gap-2 text-base">
        <li>
          <b className="font-semibold">
            {names.length} people in {gs.length} {gs.length === 1 ? "group" : "groups"}
          </b>
          {gs.length === 1 ? ": everyone here is connected to everyone else, directly or through someone." : " that do not talk to each other except through you. Each gap is a structural hole you span."}
        </li>
        <li>
          <b className="font-semibold">{names[top]}</b> adds the most: {topShare}% of your constraint, because you lean on them{byContact[top] > 1 / names.length ** 2 + 1e-9 ? " and on the people they know" : ""}.
        </li>
        <li>
          <b className="font-semibold">One more contact</b> who knows none of these would take it from {c} to {next}.
        </li>
      </ul>

      <details className="group/read">
        <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline [&::-webkit-details-marker]:hidden">
          <ChevronDown aria-hidden className="size-4 transition-transform group-open/read:rotate-180" />
          How to read it
        </summary>
        <div className="grid gap-2 pt-1 text-base">
          <p>Constraint adds up, for each contact, how much of your attention goes to them directly and through the people they know. Few contacts who all know each other score high; many contacts in separate groups score low.</p>
          <p>Burt weighed each tie by how close it was. Here every tie counts the same, as in his own worked example, so read the comparison with his managers as rough.</p>
          <p>In Burt&apos;s studies, managers with lower constraint were rated and paid better and had ideas judged more valuable. That is an association, not proof that opening your network causes it.</p>
        </div>
      </details>

      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href={lessonPath("s20")}>
            Lesson {sessionById("s20")?.n}: {sessionById("s20")?.title} <ArrowRight className="size-4" />
          </Link>
        </Button>
        <ShareResult text={`My network constraint: ${c}. Burt's managers averaged ${Math.round(BURT_MEAN)}.`} path="/play/network/" />
        <Button variant="outline" onClick={() => (setK(0), setStage("ties"))}>
          <RotateCcw className="size-4" /> Change who knows whom
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            patchLab({ "g-network": undefined })
            setNames([])
            setTies([])
            setStage("intro")
          }}
        >
          Clear the names
        </Button>
      </div>
      <Disclaimer>Network constraint from Burt (1992), Structural Holes, with the formula and worked example in the appendix to Brokerage and Closure (2005). Reference mean 27.9, standard deviation 10.5, across 841 managers.</Disclaimer>
    </GameShell>
  )
}
