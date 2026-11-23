"use client"

import * as React from "react"
import Link from "next/link"
import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Emphasis } from "@/components/brand/emphasis"
import { useProgress } from "@/lib/store"
import { lessonPath, seededOrder, sessionById } from "@/data/course"
import { DECIDE_QUIZ, decideResult } from "@/data/decide"
import { DecideChart, type Picked } from "./decide-chart"
import { RESULT_GAMES, SPREAD, resultImage, resultPath, resultSlug } from "@/data/results"
import { BRAND } from "@/brand"
import { Burst } from "./burst"
import { Choice, Disclaimer, GameShell, ProgressLine, useNumberKeys } from "./games"
import { ShareResult } from "./share"

/*
  How do you decide? Ten situations on Tannenbaum and Schmidt's line from "the leader decides and announces" to "the
  team decides within limits". The result names a way only when one leads (lib/lead.ts), like every quiz here, and
  shows each answer on the line, so you can see whether you moved with the situation.
*/


export function DecideGame() {
  const { lab, setLab } = useProgress()
  const [picks, setPicks] = React.useState<Picked[]>([])
  const [fire, setFire] = React.useState(0)
  // The question on screen is always the next unanswered one, worked out from the answers themselves, so two quick
  // taps or key presses before a re-render can never answer the same question twice or skip one.
  const step = Math.min(picks.length, DECIDE_QUIZ.length - 1)
  const done = picks.length === DECIDE_QUIZ.length
  const Q = DECIDE_QUIZ[step]
  const order = React.useMemo(() => seededOrder(Q.o.length, `decide-${step}`), [Q, step])

  const pick = (i: number) =>
    setPicks((p) => {
      if (p.length >= DECIDE_QUIZ.length) return p
      const q = DECIDE_QUIZ[p.length]
      const o = q.o[seededOrder(q.o.length, `decide-${p.length}`)[i]]
      return o ? [...p, { tag: q.tag, way: o[1], point: o[2] }] : p
    })
  // Once all ten are in: the burst, and the result kept for the sheet.
  React.useEffect(() => {
    if (!done) return
    setFire((f) => f + 1)
    setLab("g-decide", decideResult(picks).lead ?? SPREAD)
    // Only when the tenth answer lands.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done])
  useNumberKeys(4, pick, !done)

  if (done) {
    const { lead } = decideResult(picks)
    const g = RESULT_GAMES.decide
    const key = lead ?? SPREAD
    const [pre, word, post] = g.heading(key)
    return (
      <GameShell title="How do you decide?">
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-start">
          <Burst fire={fire} />
          <div className="grid content-start gap-4">
            <p className="font-serif text-5xl leading-none tracking-[-0.02em] sm:text-6xl">
              {pre}
              <Emphasis>{word}</Emphasis>
              {post}
            </p>
            <p className="text-lg text-pretty text-muted-foreground">{g.desc(key)}</p>
            <p className="text-base text-pretty">No point on the line is best in general. The right one depends on you, the team and the situation.</p>
            <div className="grid gap-1 border-t border-border pt-4">
              <p className="text-sm text-muted-foreground">Lessons that help</p>
              {g.lessons!(key).map((id) => {
                const s = sessionById(id)!
                return (
                  <Link key={id} href={lessonPath(id)} className="inline-flex min-h-11 w-fit items-center text-xl font-semibold underline-offset-4 hover:underline">
                    {s.n}. {s.title}
                  </Link>
                )
              })}
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <ShareResult text={`${g.label(key)}. How do you decide?`} path={resultPath("decide", key)} image={resultImage("decide", key)} fileName={`${BRAND.id}-decide-${resultSlug(key)}.png`} />
              <Button
                variant="ghost"
                onClick={() => setPicks([])}
              >
                <RotateCcw className="size-4" /> Retake
              </Button>
            </div>
          </div>
          <DecideChart top={lead} picks={picks} />
        </div>
        <Disclaimer>
          For fun, not a validated assessment. Based on Tannenbaum and Schmidt (1958, 1973).{" "}
          <Link href="/frameworks/continuum-7/" className="font-semibold text-foreground underline-offset-4 hover:underline">
            The leadership continuum
          </Link>
          {" · "}
          <Link href="/sheet/" className="font-semibold text-foreground underline-offset-4 hover:underline">
            Your sheet
          </Link>
        </Disclaimer>
      </GameShell>
    )
  }

  const last = lab<string | null>("g-decide", null)
  return (
    <GameShell kind={`Test · ${DECIDE_QUIZ.length} calls`} title="How do you decide?">
      <ProgressLine value={step} max={DECIDE_QUIZ.length} label="Call" />
      <fieldset key={step} className="grid gap-3 animate-in fade-in slide-in-from-right-1 duration-(--dur-ui) ease-(--ease-draft)">
        <legend className="t-question mb-4 sm:text-3xl">{Q.q}</legend>
        {order.map((oi, i) => (
          <Choice key={oi} k={i + 1} onClick={() => pick(i)}>
            {Q.o[oi][0]}
          </Choice>
        ))}
      </fieldset>
      {last && step === 0 && <p className="text-xs text-muted-foreground">{last === SPREAD ? "Last time, no clear lead." : `Last time: ${last}.`}</p>}
    </GameShell>
  )
}
