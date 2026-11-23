"use client"

import * as React from "react"
import Link from "next/link"
import { track } from "@vercel/analytics"
import { ArrowRight, Check as CheckIcon, RotateCcw, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Emphasis } from "@/components/brand/emphasis"
import { lessonPath, sessionById } from "@/data/course"
import { VALUES, mirrorBackHash, mirrorHash, mostSeen, readMirror, readMirrorAnswers } from "@/data/games"
import { useProgress } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Burst } from "./burst"

/*
  The values mirror. After the card sort, a person sends a link that carries their top five. Whoever opens it picks the
  five values they see in that person, then sees the five in their order, with the matches marked, and can send their
  picks back. No account, no server: the five live in the link, and the answer goes back as a message.
*/

type Status = "" | "copied" | "shared" | "manual"

/** Share sheet on phones, the clipboard elsewhere, a field to copy by hand when both are refused. */
async function send(text: string, url: string, event: string, setStatus: (s: Status) => void) {
  const message = url ? `${text} ${url}` : text
  try {
    if (navigator.share) {
      await navigator.share(url ? { text, url } : { text })
      setStatus("shared")
      track(event, { method: "share sheet" })
      return
    }
  } catch (e) {
    if ((e as Error)?.name === "AbortError") return
  }
  try {
    await navigator.clipboard.writeText(message)
    setStatus("copied")
    track(event, { method: "copied" })
  } catch {
    setStatus("manual")
  }
}

function SendButton({ label, text, url, event }: { label: string; text: string; url?: () => string; event: string }) {
  const [status, setStatus] = React.useState<Status>("")
  const [shown, setShown] = React.useState("")
  return (
    <>
      <Button
        onClick={() => {
          const u = url?.() ?? ""
          setShown(u ? `${text} ${u}` : text)
          void send(text, u, event, setStatus)
        }}
      >
        {status ? <CheckIcon className="size-4" /> : <Send className="size-4" />}
        {status === "copied" ? "Copied" : status === "shared" ? "Sent" : status === "manual" ? "Copy it below" : label}
      </Button>
      {status === "manual" && (
        <input
          readOnly
          aria-label="Message to copy"
          value={shown}
          onFocus={(e) => e.currentTarget.select()}
          className="h-11 w-full min-w-0 basis-full rounded-md border border-rule/60 bg-card px-3 font-mono text-base pointer-fine:text-xs"
        />
      )}
      <span className="sr-only" role="status">
        {status === "copied" ? "Copied" : status === "manual" ? "Copy the message from the field" : ""}
      </span>
    </>
  )
}

/** The first name a visitor gave to the mirror or their sheet, kept in this browser so they type it once. */
export function useFirstName() {
  const { lab, setLab, ready } = useProgress()
  const stored = ready ? lab<string>("g-name", "") : ""
  const [name, setName] = React.useState<string | null>(null)
  return [name ?? stored, (v: string) => setName(v), () => name !== null && setLab("g-name", name.trim().slice(0, 24))] as const
}

/** On the card sort's result: send your five to people who know you, and see what has come back. */
export function MirrorInvite({ ranked }: { ranked: string[] }) {
  const { lab, ready } = useProgress()
  const [name, setName, keepName] = useFirstName()
  const answers = ready ? readMirrorAnswers(lab<unknown>("g-mirror", null)) : []
  const top = mostSeen(answers, ranked)[0]
  return (
    <div className="grid gap-3 border-t border-border pt-6">
      <p className="text-lg font-semibold">Ask people what they see in you</p>
      {answers.length > 0 && (
        <p className="text-base text-muted-foreground">
          {answers.length === 1 ? "1 answer so far" : `${answers.length} answers so far`}
          {top && `. Seen in you most: ${top.value}`}.{" "}
          <Link href="/sheet/" className="font-semibold text-foreground underline-offset-4 hover:underline">
            On your sheet
          </Link>
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="mirror-name" className="sr-only">
          Your first name
        </label>
        <Input
          id="mirror-name"
          value={name}
          maxLength={24}
          autoComplete="given-name"
          placeholder="Your first name"
          onChange={(e) => setName(e.target.value)}
          className="h-11 w-full max-w-[15rem] text-base"
        />
        <SendButton
          label="Send the link"
          text="What do I value? Pick the five you see in me, then see mine."
          url={() => {
            keepName()
            return `${location.origin}/play/mirror/${mirrorHash(ranked, name)}`
          }}
          event="Mirror sent"
        />
      </div>
    </div>
  )
}

const chip = (on: boolean) =>
  cn(
    "inline-flex min-h-11 items-center rounded-full border px-4 text-sm press disabled:opacity-40",
    on ? "border-foreground bg-foreground text-background" : "border-border bg-background/40 hover:border-foreground/60"
  )

/** The page a mirror link opens. */
export function MirrorGame() {
  const [me, setMe, keepMe] = useFirstName()
  // The five live in the hash, which the server never sees, so the page reads it after it loads.
  const [link, setLink] = React.useState<ReturnType<typeof readMirror> | undefined>(undefined)
  const [picked, setPicked] = React.useState<string[]>([])
  const [done, setDone] = React.useState(false)
  const [fire, setFire] = React.useState(0)
  React.useEffect(() => {
    const read = () => setLink(readMirror(window.location.hash))
    read()
    window.addEventListener("hashchange", read)
    return () => window.removeEventListener("hashchange", read)
  }, [])

  if (link === undefined) return <div className="min-h-80" />

  if (!link)
    return (
      <Shell kind="Values mirror" title="What do they value?">
        <p className="t-question max-w-[46ch] sm:text-3xl">
          Sort your own values, then send people a link. They pick the five they see in you.
        </p>
        <div>
          <Button asChild size="lg">
            <Link href="/play/values/">
              Sort your values <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </Shell>
    )

  const who = link.name || "them"
  const Who = link.name || "This person"
  const match = picked.filter((v) => link.five.includes(v))

  if (!done)
    return (
      <Shell kind="Values mirror" title={link.name ? `What does ${link.name} value?` : "What do they value?"}>
        <div className="flex items-baseline justify-between gap-4">
          <p className="t-question sm:text-3xl">Pick the five you see in {who}.</p>
          <span className="shrink-0 font-mono text-sm text-muted-foreground tnum">{picked.length} of 5</span>
        </div>
        <ul className="flex flex-wrap gap-2" aria-label="Values">
          {VALUES.map((v) => {
            const on = picked.includes(v)
            return (
              <li key={v}>
                <button
                  type="button"
                  aria-pressed={on}
                  disabled={!on && picked.length >= 5}
                  onClick={() => setPicked((p) => (on ? p.filter((x) => x !== v) : [...p, v]))}
                  className={chip(on)}
                >
                  {v}
                </button>
              </li>
            )
          })}
        </ul>
        <div className="flex justify-end">
          <Button
            disabled={picked.length < 5}
            onClick={() => {
              setDone(true)
              setFire((f) => f + 1)
              track("Mirror answered", { match: picked.filter((v) => link.five.includes(v)).length })
            }}
          >
            See {link.name ? `${link.name}’s` : "their"} five <ArrowRight className="size-4" />
          </Button>
        </div>
      </Shell>
    )

  const lesson = sessionById("s24")
  return (
    <Shell kind="Values mirror" title={link.name ? `What does ${link.name} value?` : "What do they value?"}>
      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
        <Burst fire={fire} />
        <div className="grid content-start gap-3">
          <p className="font-serif text-6xl leading-none tracking-[-0.02em] tnum">
            <Emphasis>{match.length}</Emphasis> of 5
          </p>
          <p className="text-lg text-pretty text-muted-foreground">
            {match.length === 5
              ? `You see ${who} the way ${link.name || "they"} ${link.name ? "does" : "do"}.`
              : match.length
                ? `You and ${who} agree on ${["one", "two", "three", "four"][match.length - 1]}.`
                : `None of your five are in ${link.name ? `${link.name}’s` : "their"} five.`}
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <label htmlFor="mirror-me" className="sr-only">
              Your first name
            </label>
            <Input
              id="mirror-me"
              value={me}
              maxLength={24}
              autoComplete="given-name"
              placeholder="Your first name"
              onChange={(e) => setMe(e.target.value)}
              className="h-11 w-full max-w-[15rem] text-base"
            />
            {/* The answer goes back as a link: opening it puts your five on their sheet. */}
            <SendButton
              label={link.name ? `Send ${link.name} your five` : "Send your five back"}
              text={`I see in you: ${picked.join(", ")}. ${match.length} of 5 match yours.`}
              url={() => {
                keepMe()
                return `${location.origin}/sheet/${mirrorBackHash(picked, link.five, me)}`
              }}
              event="Mirror answer sent"
            />
            <Button
              variant="ghost"
              onClick={() => {
                setPicked([])
                setDone(false)
              }}
            >
              <RotateCcw className="size-4" /> Pick again
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-5">
          <Column title={`${Who}’s five`} items={link.five} marked={match} numbered />
          <Column title="Yours" items={picked} marked={match} />
        </div>
      </div>
      <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span>Nothing is saved.</span>
        <Link href="/play/values/" className="font-semibold text-foreground underline-offset-4 hover:underline">
          Sort your own values
        </Link>
        {lesson && (
          <Link href={lessonPath(lesson.id)} className="font-semibold text-foreground underline-offset-4 hover:underline">
            Lesson {lesson.n}: {lesson.title}
          </Link>
        )}
      </p>
    </Shell>
  )
}

function Column({ title, items, marked, numbered }: { title: string; items: string[]; marked: string[]; numbered?: boolean }) {
  return (
    <div className="grid content-start gap-2">
      <p className="label-mono">{title}</p>
      <ol className="grid gap-1.5">
        {items.map((v, i) => {
          const on = marked.includes(v)
          return (
            <li key={v} className={cn("flex min-h-11 min-w-0 items-center gap-2 rounded-md border px-2.5 text-base sm:gap-3 sm:px-3", on ? "border-foreground font-semibold" : "border-border text-muted-foreground")}>
              {numbered && <span className="font-mono text-xs text-muted-foreground tnum">{i + 1}</span>}
              <span className="min-w-0 flex-1 break-words">{v}</span>
              {on && <span className="size-2 shrink-0 rounded-full bg-signal" aria-label="match" />}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function Shell({ kind, title, children }: { kind: string; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl relative min-w-0 bg-card">
      <header className="flex items-baseline justify-between gap-4 border-b border-border px-5 py-4 sm:px-7">
        <h2 className="text-xl leading-tight sm:text-2xl">{title}</h2>
        <span className="label-mono shrink-0">{kind}</span>
      </header>
      <div className="grid gap-6 p-5 sm:p-7">{children}</div>
    </section>
  )
}
