"use client"

import * as React from "react"
import Link from "next/link"
import { track } from "@vercel/analytics"
import { ArrowRight, Check as CheckIcon, ChevronDown, RotateCcw, Undo2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fwById, lessonPath, sessionById } from "@/data/course"
import { TALKS, replyFor, talkEnding, talkWalk, type Talk, type TalkGrade } from "@/data/rewind"
import { useProgress, useReducedMotion } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Disclaimer, GameShell, useNumberKeys } from "./games"
import { ShareResult } from "./share"

/*
  Rewind: a hard conversation as a chat, one line at a time (src/data/rewind.ts). Pick a line, they answer, and the
  line is marked with the framework row it puts to work. Any of your lines can be rewound and tried another way,
  which is the point: rehearsing with the chance to retry beat a lecture (Rehearsal, CHI 2024).
*/

const GRADE_LABEL: Record<TalkGrade, string> = { strong: "Strong", tradeoff: "Trade-off", costly: "Costly" }
const REPLY_MS = 750

function Mark({ g }: { g: TalkGrade }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-5 shrink-0 place-items-center rounded-full border",
        g === "strong" ? "border-ok bg-ok text-background" : "border-foreground bg-foreground text-background"
      )}
    >
      {g === "strong" ? <CheckIcon className="size-3" strokeWidth={3} /> : g === "costly" ? <X className="size-3" strokeWidth={3} /> : <span className="block size-1.5 rounded-full bg-background" />}
    </span>
  )
}

export function RewindGame() {
  const t = TALKS[0]
  const { lab, setLab, touch, ready } = useProgress()
  const reduced = useReducedMotion()
  const best = lab<number>("g-rewind-best", 0)
  const [picks, setPicks] = React.useState<number[] | null>(null)
  const [shown, setShown] = React.useState(0)
  const [rewinds, setRewinds] = React.useState(0)
  const [why, setWhy] = React.useState<number | null>(null)
  const turnHead = React.useRef<HTMLParagraphElement>(null)
  const finished = picks !== null && picks.length === t.turns.length && shown === picks.length

  // their reply arrives a beat after your line, as in a real chat; at once with reduced motion
  React.useEffect(() => {
    if (!picks || shown >= picks.length) return
    const h = setTimeout(() => setShown(picks.length), reduced ? 0 : REPLY_MS)
    return () => clearTimeout(h)
  }, [picks, shown, reduced])

  // once the reply is in, move focus to the next turn (the options that had it are gone)
  React.useEffect(() => {
    if (picks && shown === picks.length && picks.length > 0 && picks.length < t.turns.length) turnHead.current?.focus()
  }, [shown, picks, t.turns.length])

  const strongCount = (p: number[]) => p.filter((j, k) => t.turns[k].lines[j].grade === "strong").length

  React.useEffect(() => {
    if (!finished || !picks) return
    const s = strongCount(picks)
    if (s > best) setLab("g-rewind-best", s)
    touch()
    track("Rewind finished", { talk: t.id, strong: s, rewinds })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished])

  const say = (j: number) => {
    if (!picks || shown < picks.length || picks.length >= t.turns.length) return
    setPicks([...picks, j])
  }
  const rewindTo = (k: number) => {
    if (!picks) return
    setPicks(picks.slice(0, k))
    setShown(k)
    setRewinds((r) => r + 1)
    track("Rewind", { talk: t.id, turn: k + 1 })
    requestAnimationFrame(() => turnHead.current?.focus())
  }
  const waiting = picks !== null && shown < picks.length
  const turn = picks && !waiting && picks.length < t.turns.length ? t.turns[picks.length] : null
  useNumberKeys(turn?.lines.length ?? 0, say, !!turn)

  if (!ready) return <div className="min-h-[520px] rounded-2xl bg-card" aria-busy="true" />
  const lesson = sessionById(t.sheet)

  if (!picks)
    return (
      <GameShell title={`Rewind: ${t.title.toLowerCase()}`}>
        <p className="max-w-[60ch] text-lg">{t.setup}</p>
        {/* The conversation, already started: the first thing they say, and the way in. */}
        <div className="grid justify-items-start gap-1">
          <span className="label-mono">{t.them}</span>
          <p className="max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5 text-base leading-relaxed">{t.opener}</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="lg" onClick={() => (setPicks([]), setShown(0), setRewinds(0))}>
            Start the conversation <ArrowRight className="size-4" />
          </Button>
          {best > 0 && <span className="font-mono text-sm text-muted-foreground tnum">Best {best} of {t.turns.length} strong</span>}
        </div>
        <Disclaimer>
          A made-up conversation. {t.them}&apos;s replies are a simple script of how one person might take each line; real people vary.
        </Disclaimer>
      </GameShell>
    )

  const { ending } = talkEnding(t, picks.length === t.turns.length ? picks : [])
  return (
    <GameShell title={`Rewind: ${t.title.toLowerCase()}`}>
      <p className="t-read">{t.setup}</p>
      <div role="log" aria-live="polite" aria-label="The conversation">
        <ol className="grid gap-4">
          <li className="grid justify-items-start gap-1">
            <span className="label-mono">{t.them}</span>
            <p className="max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5 text-base leading-relaxed">{t.opener}</p>
          </li>
          {picks.map((j, k) => {
            const line = t.turns[k].lines[j]
            const f = fwById(line.fw)
            const row = f?.rows[line.row]
            const replied = k < shown
            return (
              <React.Fragment key={`${k}-${j}`}>
                <li className="grid justify-items-end gap-1.5">
                  <span className="sr-only">You</span>
                  <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-foreground px-4 py-2.5 text-base leading-relaxed text-background">{line.says}</p>
                  {replied && (
                    <div className="grid w-full max-w-[85%] justify-items-end gap-1 justify-self-end">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          aria-expanded={why === k}
                          aria-controls={`rewind-why-${k}`}
                          onClick={() => setWhy(why === k ? null : k)}
                          className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 transition-colors duration-(--dur-ui) hover:bg-muted"
                        >
                          <Mark g={line.grade} />
                          <span className={cn("label-mono", line.grade === "strong" ? "text-ok" : "text-foreground")}>{GRADE_LABEL[line.grade]}</span>
                          <ChevronDown aria-hidden className={cn("size-4 transition-transform duration-(--dur-ui)", why === k && "rotate-180")} />
                        </button>
                        <Button variant="outline" size="sm" className="min-h-11" onClick={() => rewindTo(k)} aria-label={`Rewind to your line ${k + 1} and try another`}>
                          <Undo2 className="size-4" /> Rewind
                        </Button>
                      </div>
                      <div id={`rewind-why-${k}`} hidden={why !== k} className={cn("feedback w-full", line.grade === "strong" && "feedback-ok")}>
                        {f && row && (
                          <p className="label-mono text-foreground">
                            {f.name}: {row[0]}
                          </p>
                        )}
                        <p className="text-base">{line.why}</p>
                      </div>
                    </div>
                  )}
                </li>
                {replied ? (
                  <li className="grid justify-items-start gap-1">
                    <span className="sr-only">{t.them}</span>
                    <p className="max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5 text-base leading-relaxed">{replyFor(t, picks, k)}</p>
                  </li>
                ) : (
                  <li className="grid justify-items-start gap-1" aria-label={`${t.them} is answering`}>
                    <p className="flex gap-1 rounded-2xl rounded-bl-sm bg-muted px-4 py-3.5" aria-hidden>
                      {[0, 1, 2].map((d) => (
                        <span key={d} className="size-1.5 animate-pulse rounded-full bg-muted-foreground" style={{ animationDelay: `${d * 150}ms` }} />
                      ))}
                    </p>
                  </li>
                )}
              </React.Fragment>
            )
          })}
        </ol>
      </div>

      {turn && (
        <div className="grid gap-3 border-t border-border pt-5">
          <p ref={turnHead} tabIndex={-1} className="label-mono outline-none" id="rewind-turn">
            Your turn {picks.length + 1} of {t.turns.length} · {turn.aim}
          </p>
          <div role="group" aria-labelledby="rewind-turn" className="grid gap-2">
            {turn.lines.map((l, j) => (
              <button
                key={j}
                type="button"
                onClick={() => say(j)}
                className="choice group press"
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-[4px] border border-rule/70 font-mono text-xs text-muted-foreground group-hover:border-foreground group-hover:text-foreground">{j + 1}</span>
                <span>&ldquo;{l.says}&rdquo;</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {finished && (
        <div className="grid gap-5 border-t border-border pt-5" role="status">
          {/* How far they opened up, turn by turn, and the ending it reached: the conversation as a line, the way a
              chess review draws the game, a mark on every move. */}
          <TalkTrace t={t} picks={picks} />
          <div className="grid gap-2">
            <p className="font-serif text-3xl leading-tight tracking-[-0.01em]">{ending.title}</p>
            <p className="text-base leading-relaxed">{ending.then}</p>
          </div>
          {picks.some((j, k) => t.turns[k].lines[j].later) && (
            <ul className="grid gap-2" aria-label="What the weaker lines cost">
              {picks.map((j, k) => {
                const l = t.turns[k].lines[j]
                return l.later ? (
                  <li key={k} className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 text-base leading-relaxed">
                    <span className="mt-0.5 flex items-center gap-1.5 self-start">
                      <Mark g={l.grade} />
                      <span className="font-mono text-xs text-muted-foreground tnum">{k + 1}</span>
                    </span>
                    <span>{l.later}</span>
                  </li>
                ) : null
              })}
            </ul>
          )}
          <p className="font-mono text-sm tnum">
            {strongCount(picks)} of {t.turns.length} lines strong
            {rewinds > 0 ? `, ${rewinds} ${rewinds === 1 ? "rewind" : "rewinds"}` : ""}.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => (setPicks([]), setShown(0), setRewinds(0))}>
              <RotateCcw className="size-4" /> Start over
            </Button>
            <ShareResult text={`I got ${strongCount(picks)} of ${t.turns.length} lines strong in a hard feedback conversation on Leadersheet. Rewind lets you retry any line.`} path="/play/rewind/" />
            {lesson && (
              <Button asChild variant="outline">
                <Link href={lessonPath(lesson.id)}>Open lesson {lesson.n}</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </GameShell>
  )
}

/**
 * The conversation as a line: where they started (the dashed level), one step up when a line opened them up, down
 * when it shut them down, flat when it did neither, with the line's mark on each step. Drawn from the same `open`
 * values the ending is chosen by (talkEnding), so the picture and the result cannot disagree.
 */
function TalkTrace({ t, picks }: { t: Talk; picks: number[] }) {
  const steps = picks.map((j, k) => t.turns[k].lines[j])
  const ys = talkWalk(t, picks)
  const n = t.turns.length
  // the range fits the walk, so a one-step change still reads as a step
  const lim = Math.max(2, ...ys.map(Math.abs)) + 0.5
  const W = 600,
    H = 150,
    L = 16,
    R = W - 16,
    T = 18,
    B = H - 18
  const X = (k: number) => L + (k / n) * (R - L)
  const Y = (v: number) => T + ((lim - v) / (2 * lim)) * (B - T)
  const { ending } = talkEnding(t, picks)
  const d = ys.map((v, k) => `${k ? "L" : "M"}${X(k)},${Y(v)}`).join(" ")
  const label = `How far ${t.them} opened up, turn by turn: ${steps.map((l, k) => `turn ${k + 1}, ${GRADE_LABEL[l.grade].toLowerCase()}, ${l.open > 0 ? "opened up" : l.open < 0 ? "shut down" : "no change"}`).join("; ")}. Ending: ${ending.title}.`
  return (
    <div className="relative w-full max-w-[640px]">
      <svg viewBox={`0 0 ${W} ${H}`} className="viz" role="img" aria-label={label}>
        <line x1={L} x2={R} y1={Y(0)} y2={Y(0)} className="grid-line" strokeDasharray="4 4" />
        <path d={d} className="edge-ink draw" style={{ strokeWidth: 2.5 }} pathLength={1} />
        <circle cx={X(0)} cy={Y(0)} r={4} className="fill-ink" />
      </svg>
      <span aria-hidden className="absolute top-0 left-0 font-mono text-xs text-muted-foreground">
        Opens up
      </span>
      <span aria-hidden className="absolute bottom-0 left-0 font-mono text-xs text-muted-foreground">
        Shuts down
      </span>
      {steps.map((l, k) => (
        <span key={k} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${(X(k + 1) / W) * 100}%`, top: `${(Y(ys[k + 1]) / H) * 100}%` }} aria-hidden>
          <Mark g={l.grade} />
        </span>
      ))}
    </div>
  )
}
