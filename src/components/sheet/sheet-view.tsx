"use client"

import * as React from "react"
import Link from "next/link"
import { track } from "@vercel/analytics"
import { ArrowRight, Check as CheckIcon, Download, Printer, Share2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LogoMark, Wordmark } from "@/brand"
import { FRAMEWORKS, SESSIONS, lessonPath } from "@/data/course"
import { CASES, GRADE_LABEL, type Grade } from "@/data/cases"
import { addMirrorAnswer, mirrorMatch, readMirrorAnswers, readMirrorBack, type MirrorAnswer } from "@/data/games"
import { RESULT_GAMES, SPREAD, resultPath } from "@/data/results"
import { ROUNDS } from "@/lib/team-math"
import { SHEET_GAMES, decodeSheet, encodeSheet, gradeCount, gradeOf, isEmpty, sheetFrom, sheetShareText, type SheetData } from "@/lib/sheet"
import { localDay, streakOf, useProgress } from "@/lib/store"
import { cn } from "@/lib/utils"
import { drawSheet } from "./sheet-image"

/*
  Your sheet. One page that fills in as you use the site, made from what this browser already keeps. It is the thing
  you keep (print it) and the thing you send: one image where the phone can share files (Spotify Wrapped and
  Duolingo's year in review both send a card, not a page), and a link otherwise. The link carries the sheet after #,
  so whoever opens it sees the same sheet, then "Make your first call".
*/

const FIRST_CALL = `${lessonPath("s1")}#your-call`
const SHORT: Record<(typeof SHEET_GAMES)[number], string> = { decide: "How you decide", style: "Leadership style", conflict: "Conflict style", power: "Power", listen: "Listening", culture: "Culture fit" }
const longDate = (d = new Date()) => d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })

type View = { kind: "loading" } | { kind: "own" } | { kind: "shared"; data: SheetData; name: string }

export function SheetView() {
  const { state, ready, lab, setLab } = useProgress()
  const [view, setView] = React.useState<View>({ kind: "loading" })
  const [added, setAdded] = React.useState<MirrorAnswer | null>(null)
  // The latest answers, for a mirror link opened later in the same tab.
  const answersRef = React.useRef<unknown>(null)
  answersRef.current = state.lab["g-mirror"]

  // The part after # never reaches a server: a shared sheet, a mirror answer coming back, or an old /sheet/#framework link.
  React.useEffect(() => {
    if (!ready) return
    const read = () => {
      const h = window.location.hash
      const fw = h.slice(1)
      if (fw && FRAMEWORKS.some((f) => f.id === fw)) {
        window.location.replace(`/frameworks/${fw}/`)
        return
      }
      const back = readMirrorBack(h)
      if (back) {
        const a = { ...back, at: localDay() }
        setLab("g-mirror", addMirrorAnswer(readMirrorAnswers(answersRef.current), a))
        setAdded(a)
        history.replaceState(null, "", window.location.pathname)
        track("Mirror answer opened", { match: mirrorMatch(a) })
        setView({ kind: "own" })
        return
      }
      const shared = decodeSheet(h)
      setView(shared ? { kind: "shared", ...shared } : { kind: "own" })
    }
    read()
    window.addEventListener("hashchange", read)
    return () => window.removeEventListener("hashchange", read)
    // Reads the store once it has loaded; the store itself changes as the mirror answer is added.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])

  if (view.kind === "loading")
    return (
      <div className="min-h-[70vh]" aria-busy>
        <h1 className="sr-only">Your sheet</h1>
      </div>
    )

  if (view.kind === "shared")
    return (
      <div className="grid gap-6">
        <Sheet data={view.data} title={view.name ? `${view.name}’s sheet` : "A sheet"} />
        <div className="flex flex-wrap items-center gap-3 print:hidden">
          <Button asChild size="lg">
            <Link href={FIRST_CALL}>
              Make your first call <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            {/* A full load on purpose: it drops the shared sheet in the address and opens the visitor's own. */}
            {/* oxlint-disable-next-line nextjs/no-html-link-for-pages */}
            <a href="/sheet/">Your own sheet</a>
          </Button>
        </div>
      </div>
    )

  const data = sheetFrom(state, streakOf(state.days).count)
  const answers = readMirrorAnswers(state.lab["g-mirror"])
  const name = lab<string>("g-name", "")
  return (
    <div className="grid gap-6">
      {added && (
        <p role="status" className="rounded-2xl bg-card px-5 py-4 text-base print:hidden">
          <b className="font-semibold">On your sheet:</b> what {added.by || "they"} {added.by ? "sees" : "see"} in you, {mirrorMatch(added)} of 5 like yours.
        </p>
      )}
      <Sheet data={data} title="Your sheet" date={longDate()} answers={answers} />
      {isEmpty(data) ? null : <ShareSheet data={data} name={name} />}
    </div>
  )
}

/* ─────────────── The sheet ─────────────── */

export function Sheet({ data, title, date, answers }: { data: SheetData; title: string; date?: string; answers?: MirrorAnswer[] }) {
  const empty = isEmpty(data)
  const own = !!answers
  const taken = SHEET_GAMES.filter((g) => data.styles[g])
  const facts = [
    data.passed.length ? `${data.passed.length} of ${SESSIONS.length} lessons passed` : data.opened ? `${data.opened} of ${SESSIONS.length} lessons opened` : "",
    data.streak ? `${data.streak} ${data.streak === 1 ? "day" : "days"} in a row` : "",
  ].filter(Boolean)
  return (
    <article id="sheet" className="grid gap-0 rounded-[28px] bg-card px-5 py-7 sm:px-10 sm:py-10 print:rounded-none print:p-0">
      <header className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-3" data-sheet-brand>
          <LogoMark className="size-9" />
          <Wordmark className="h-[18px]" />
        </span>
        {date && <span className="hidden text-sm text-muted-foreground sm:inline print:inline">{date}</span>}
      </header>
      <h1 className="mt-10 text-[44px] leading-none sm:text-6xl">{title}</h1>
      <p className="mt-3 text-lg text-muted-foreground tnum">{empty ? "It fills in as you go, and stays in this browser." : facts.join(" · ")}</p>
      {empty && own && (
        <div className="mt-6 print:hidden">
          <Button asChild size="lg">
            <Link href={FIRST_CALL}>
              Make your first call <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      )}

      <Part title={own ? "Your calls" : "Calls"}>
        <CallRow data={data} />
        {data.daily.made > 0 && (
          <p className="text-base tnum">
            <Link href="/today/" className="font-semibold underline-offset-4 hover:underline">
              Today’s call
            </Link>
            : {data.daily.made} made, {data.daily.strong} strong.
          </p>
        )}
        {data.calls.length ? (
          <>
            <p className="text-base tnum">{gradeLine(gradeCount(data.calls))}</p>
            <ol className="grid gap-x-8 sm:grid-cols-2">
              {data.calls.map((c) => {
                const s = SESSIONS.find((x) => x.id === c.sheet)!
                const choice = CASES.find((x) => x.sheet === c.sheet)!.choices[c.choice]
                return (
                  <li key={c.sheet} className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-3 border-t border-border py-3 break-inside-avoid">
                    <GradeMark grade={choice.grade} />
                    <span className="grid gap-0.5">
                      <Link href={`${lessonPath(s.id)}#your-call`} className="w-fit text-base font-semibold underline-offset-4 hover:underline">
                        {s.n}. {s.title}
                      </Link>
                      <span className="text-sm text-pretty text-muted-foreground">{choice.says}</span>
                      <span className="text-sm">{GRADE_LABEL[choice.grade]}</span>
                    </span>
                  </li>
                )
              })}
            </ol>
          </>
        ) : (
          <Empty>
            The call you make in each lesson, and how it graded. {own && <Go href={FIRST_CALL}>Lesson 1 has one</Go>}
          </Empty>
        )}
      </Part>

      <Part title={own ? "How you lead" : "How they lead"}>
        {taken.length > 0 && (
          <dl className="grid gap-x-8 sm:grid-cols-2">
            {taken.map((g) => {
              const k = data.styles[g]!
              return (
                <div key={g} className="grid gap-0.5 border-t border-border py-3 break-inside-avoid">
                  <dt className="text-sm text-muted-foreground">{RESULT_GAMES[g].question}</dt>
                  <dd className="text-xl">
                    <Link href={resultPath(g, k)} className={cn("font-semibold underline-offset-4 hover:underline", k === SPREAD && "font-normal")}>
                      {RESULT_GAMES[g].label(k)}
                    </Link>
                  </dd>
                </div>
              )
            })}
          </dl>
        )}
        {!taken.length ? (
          <Empty>
            What the quizzes and the decide test say about how you lead, and when no style leads, that too. {own && <Go href="/play/decide/">How do you decide?</Go>}
          </Empty>
        ) : (
          own &&
          taken.length < SHEET_GAMES.length && (
            <p className="text-base text-muted-foreground print:hidden">
              Still to take:{" "}
              {SHEET_GAMES.filter((g) => !data.styles[g]).map((g, i) => (
                <React.Fragment key={g}>
                  {i > 0 && ", "}
                  <Link href={`/play/${g}/`} className="inline-block py-2.5 font-medium text-foreground underline-offset-4 hover:underline">
                    {SHORT[g]}
                  </Link>
                </React.Fragment>
              ))}
            </p>
          )
        )}
      </Part>

      <Part title={own ? "What you value" : "What they value"}>
        {data.values ? (
          <>
            <ol className="flex flex-wrap gap-x-6 gap-y-1 font-serif text-2xl sm:text-[28px]">
              {data.values.five.map((v, i) => (
                <li key={v}>
                  <span className="mr-1.5 font-sans text-sm text-muted-foreground tnum">{i + 1}</span>
                  {v}
                </li>
              ))}
            </ol>
            <p className="text-base">{own ? "Your" : "Their"} week {data.values.agrees ? "agrees" : "disagrees"}.</p>
            {answers ? (
              answers.length ? (
                <ul className="grid gap-x-8 sm:grid-cols-2">
                  {answers.map((a) => (
                    <li key={`${a.by}-${a.seen.join()}`} className="grid gap-0.5 border-t border-border py-3 break-inside-avoid">
                      <span className="text-sm text-muted-foreground tnum">
                        {a.by || "Someone"} sees · {mirrorMatch(a)} of 5 like yours
                      </span>
                      <span className="text-base">
                        {a.seen.map((v, i) => (
                          <React.Fragment key={v}>
                            {i > 0 && ", "}
                            <span className={cn(data.values!.five.includes(v) && "font-semibold")}>{v}</span>
                          </React.Fragment>
                        ))}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty>
                  What people who know you see in you. <Go href="/play/values/">Send the mirror</Go>
                </Empty>
              )
            ) : (
              data.seen && (
                <p className="text-base text-muted-foreground">
                  {data.seen.people === 1 ? "1 person" : `${data.seen.people} people`} answered the mirror. Seen most: {data.seen.top.join(", ")}.
                </p>
              )
            )}
          </>
        ) : (
          <Empty>
            Your five values, whether last week agreed, and what people who know you see. {own && <Go href="/play/values/">Sort your values</Go>}
          </Empty>
        )}
      </Part>

      <Part title="Games">
        <dl className="grid grid-cols-3 gap-x-4">
          {[
            ["Bias blitz", data.games.bias !== undefined ? `${data.games.bias} spotted` : null, "/play/bias/"],
            ["Kotter climb", data.games.climb !== undefined ? `${(data.games.climb / 1000).toFixed(1)} s` : null, "/play/climb/"],
            ["Team math", data.games.team !== undefined ? `${data.games.team} of ${ROUNDS.length}` : null, "/play/team/"],
          ].map(([label, v, href]) => (
            <div key={label} className="grid content-start gap-0.5 border-t border-border py-3">
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd className="font-mono text-xl font-medium tnum">{v ?? (own ? <Go href={href!}>Play</Go> : <span className="font-sans text-base font-normal text-muted-foreground">Not played</span>)}</dd>
            </div>
          ))}
        </dl>
      </Part>
    </article>
  )
}

function Part({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10 grid gap-3 break-inside-avoid-page">
      <h2 className="text-[26px] leading-tight">{title}</h2>
      {children}
    </section>
  )
}

const Empty = ({ children }: { children: React.ReactNode }) => <p className="text-base text-pretty text-muted-foreground">{children}</p>

function Go({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex min-h-11 items-center gap-1 text-base font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline print:hidden">
      {children} <ArrowRight className="size-3.5" />
    </Link>
  )
}

function gradeLine(n: Record<Grade, number>) {
  return `${n.strong} strong ${n.strong === 1 ? "call" : "calls"}, ${n.tradeoff} ${n.tradeoff === 1 ? "trade-off" : "trade-offs"}, ${n.costly} costly.`
}

/** One mark per lesson in course order: what the calls look like at a glance, empty where there is none yet. */
function CallRow({ data }: { data: SheetData }) {
  return (
    <ol className="flex flex-wrap gap-1.5" aria-label={`Calls made in ${data.calls.length} of ${SESSIONS.length} lessons`}>
      {SESSIONS.map((s) => {
        const c = data.calls.find((x) => x.sheet === s.id)
        return (
          <li key={s.id} title={`${s.n}. ${s.title}`}>
            <GradeMark grade={c && gradeOf(c)} small />
          </li>
        )
      })}
    </ol>
  )
}

function GradeMark({ grade, small }: { grade?: Grade; small?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-full border",
        small ? "size-[18px]" : "mt-0.5 size-5",
        grade === "strong" ? "border-ok bg-ok text-background" : grade ? "border-foreground" : "border-rule/50",
        grade === "tradeoff" && "bg-foreground"
      )}
    >
      {grade === "strong" && <CheckIcon className="size-3" strokeWidth={3} />}
      {grade === "costly" && <X className="size-3" strokeWidth={3} />}
    </span>
  )
}

/* ─────────────── Send it, save it, print it ─────────────── */

type Status = "" | "shared" | "copied" | "manual"

function ShareSheet({ data, name }: { data: SheetData; name: string }) {
  const [file, setFile] = React.useState<File | null>(null)
  const [href, setHref] = React.useState("")
  const [status, setStatus] = React.useState<Status>("")
  const [link, setLink] = React.useState("")
  const key = encodeSheet(data, name)
  // The image's address, revoked only once a newer image replaces it (or the page goes), so Save image never points at nothing.
  const urlRef = React.useRef("")
  React.useEffect(() => () => URL.revokeObjectURL(urlRef.current), [])

  // The image is drawn as soon as the sheet is known, not on the tap: Safari only opens the share sheet straight from
  // a tap, and drawing first would use up that moment.
  React.useEffect(() => {
    let gone = false
    const t = window.setTimeout(async () => {
      try {
        const brand = document.querySelector("#sheet [data-sheet-brand]")
        const blob = await drawSheet(data, name ? `${name}’s sheet` : "My sheet", { mark: brand?.querySelector("svg") ?? null, word: brand?.querySelectorAll("svg")[1] ?? null })
        if (gone) return
        const url = URL.createObjectURL(blob)
        const old = urlRef.current
        urlRef.current = url
        setFile(new File([blob], "leadersheet-sheet.png", { type: "image/png" }))
        setHref(url)
        if (old) URL.revokeObjectURL(old)
      } catch {
        // No image (an old browser): the link still goes.
      }
    }, 150)
    return () => {
      gone = true
      window.clearTimeout(t)
    }
    // Redrawn when what is on the sheet changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const share = async () => {
    const url = `${window.location.origin}/sheet/${key}`
    const text = sheetShareText(data)
    setLink(url)
    try {
      if (file && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: `${text} ${url}` })
        setStatus("shared")
        track("Sheet shared", { method: "image" })
        return
      }
      if (navigator.share) {
        await navigator.share({ title: "My sheet", text, url })
        setStatus("shared")
        track("Sheet shared", { method: "share sheet" })
        return
      }
    } catch (e) {
      if ((e as Error)?.name === "AbortError") return
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`)
      setStatus("copied")
      track("Sheet shared", { method: "copied link" })
    } catch {
      setStatus("manual")
    }
  }

  const print = () => {
    // Paper is light: print the light theme even when the page is dark.
    const root = document.documentElement
    const dark = root.classList.contains("dark")
    if (dark) root.classList.remove("dark")
    const back = () => {
      if (dark) root.classList.add("dark")
      window.removeEventListener("afterprint", back)
    }
    window.addEventListener("afterprint", back)
    window.print()
    track("Sheet printed")
  }

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <Button size="lg" onClick={share}>
        {status ? <CheckIcon className="size-4" /> : <Share2 className="size-4" />}
        {status === "copied" ? "Link copied" : status === "shared" ? "Sent" : status === "manual" ? "Copy the link below" : "Send my sheet"}
      </Button>
      {href && (
        <Button asChild size="lg" variant="outline">
          <a href={href} download="leadersheet-sheet.png">
            <Download className="size-4" /> Save image
          </a>
        </Button>
      )}
      <Button size="lg" variant="ghost" onClick={print}>
        <Printer className="size-4" /> Print
      </Button>
      {status === "manual" && (
        <input
          readOnly
          aria-label="Sheet link"
          value={link}
          onFocus={(e) => e.currentTarget.select()}
          className="h-11 w-full min-w-0 basis-full rounded-md border border-rule/60 bg-card px-3 font-mono text-base pointer-fine:text-xs"
        />
      )}
      <span className="sr-only" role="status">
        {status === "copied" ? "Link copied" : status === "manual" ? "Copy the link from the field" : ""}
      </span>
    </div>
  )
}
