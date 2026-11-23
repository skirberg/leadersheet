import { readFileSync } from "node:fs"
import { Check, Undo2, X } from "lucide-react"
import { COLORS, LogoMark, Wordmark } from "@/brand"
import { CardLabel, ShareCard, type Title, type TitleSize } from "@/components/og/share-card"
import { BRS_AGREE, BRS_ITEMS } from "@/data/brs"
import { GRADE_LABEL, type Grade } from "@/data/cases"
import { FRAMEWORKS, SESSIONS, fwById, seededOrder } from "@/data/course"
import { SURE } from "@/data/daily"
import { BIAS_ITEMS, BIAS_NAMES, CONFLICT_QUIZ, CULTURE_QUIZ, GAMES, LISTEN_QUIZ, POWER_QUIZ, STYLE_QUIZ, VALUES, type GameId } from "@/data/games"
import { JDS_DIMS, JDS_NORMS } from "@/data/jds"
import { TALKS } from "@/data/rewind"
import { REVIEW_GAPS } from "@/lib/review"
import { frameworkHeading } from "@/lib/seo"
import { cn } from "@/lib/utils"

/*
  The share cards of the pages people pass around: every game in the arcade, Today's call, class mode, Practice,
  Learn, Frameworks, the values mirror, How it's built and Brand (public/og/<id>.png, drawn by scripts/make-og.ts from
  /og/card/<id>/). Each shows the page's own content: a game's first question as you will see it, the course's seven
  parts, the review schedule from src/lib/review.ts. Every word and number comes from the data the page itself reads.
  Sentence case only and no word that does not earn its place (the owner, 22 November 2026).
*/

/** Every game in the arcade, plus the pages that are shared. Team math and the decide test keep their own cards. */
export const GAME_CARDS = GAMES.map((g) => g.id).filter((id) => id !== "team" && id !== "decide")
export const PAGE_CARDS = ["today", "today-class", "practice", "learn", "frameworks", "built", "brand", "play", "mirror"] as const
export const isPageCard = (id: string) => (PAGE_CARDS as readonly string[]).includes(id) || (GAME_CARDS as string[]).includes(id)

/* ─────────────── Parts drawn at card size ─────────────── */

/** One tick per question, the first one current, and the count: the game's own progress line, at card size. */
function Ticks({ of }: { of: number }) {
  return (
    <div className="flex items-center gap-4">
      <ol aria-hidden className="flex flex-1 gap-1.5">
        {Array.from({ length: of }, (_, k) => (
          <li key={k} className={cn("h-2 flex-1 rounded-full", k === 0 ? "bg-foreground/35" : "bg-border")} />
        ))}
      </ol>
      <span className="text-[17px] text-muted-foreground tnum">1 of {of}</span>
    </div>
  )
}

/** An answer choice at card size, as the games draw it (the number keys are left off: a card is not a keyboard). */
function Choice({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex items-center rounded-[14px] border border-border px-4 py-2 text-[17px] leading-snug", className)}>{children}</div>
}

/** A game's first question, its choices in the order the game deals them (seededOrder with the game's own key). */
function FirstQuestion({ q, o, keyOf, of }: { q: string; o: [string, string][]; keyOf: string; of: number }) {
  const order = seededOrder(o.length, keyOf)
  return (
    <div className="grid gap-5">
      <Ticks of={of} />
      <p className="font-serif text-[28px] leading-[1.15] text-balance">{q}</p>
      <div className="grid gap-1.5">
        {order.map((i) => (
          <Choice key={i}>{o[i][0]}</Choice>
        ))}
      </div>
    </div>
  )
}

/** A grade's mark at card size: a check in the ok green, a filled dot, an X in ink. Never pink. */
function Mark({ g }: { g: Grade }) {
  return (
    <span aria-hidden className={cn("grid size-11 shrink-0 place-items-center rounded-full", g === "strong" ? "bg-ok text-background" : "bg-foreground text-background")}>
      {g === "strong" ? <Check className="size-6" strokeWidth={3} /> : g === "costly" ? <X className="size-6" strokeWidth={3} /> : <span className="block size-3 rounded-full bg-background" />}
    </span>
  )
}

/** The values as the card sort lays them out. */
function ValueChips() {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {VALUES.map((v) => (
        <li key={v} className="inline-flex h-[34px] items-center rounded-full border border-border px-3 text-[15px]">
          {v}
        </li>
      ))}
    </ul>
  )
}

/** Stops on a line, left to right, each named under its stop (DESIGN.md: steps are stops on a line). */
function Stops({ names, filled = [], className }: { names: string[]; filled?: number[]; className?: string }) {
  const pct = (i: number) => (i / (names.length - 1)) * 100
  return (
    <div className={cn("relative mx-6 h-[64px]", className)}>
      <span aria-hidden className="absolute inset-x-0 top-[9px] h-0.5 bg-border" />
      {names.map((n, i) => (
        <span key={n} className="absolute top-0 grid -translate-x-1/2 justify-items-center gap-2" style={{ left: `${pct(i)}%` }}>
          <span className={cn("size-5 rounded-full border-2 border-foreground", filled.includes(i) ? "bg-foreground" : "bg-card")} />
          <span className="text-[17px] whitespace-nowrap">{n}</span>
        </span>
      ))}
    </div>
  )
}

/* ─────────────── The cards ─────────────── */

type Card = { kicker: string; title: Title | string; size?: TitleSize; line?: string; foot: string; narrow?: boolean; panel?: string; body: React.ReactNode }

const game = (id: GameId) => GAMES.find((g) => g.id === id)!
const quizFoot = (id: GameId) => `Find yours · ${parseInt(game(id).minutes)} minute quiz`

function card(id: string): Card | null {
  switch (id) {
    /* The quizzes: the first question, as the game deals it. */
    case "culture":
      return { kicker: game(id).search, title: ["Which culture fits ", "you", "?"], line: game(id).blurb, foot: quizFoot(id), narrow: true, body: <FirstQuestion {...CULTURE_QUIZ[0]} keyOf="culture-0" of={CULTURE_QUIZ.length} /> }
    case "conflict":
      return { kicker: game(id).search, title: ["How do you ", "fight", "?"], size: "xl", line: game(id).blurb, foot: quizFoot(id), narrow: true, body: <FirstQuestion {...CONFLICT_QUIZ[0]} keyOf="conflict-0" of={CONFLICT_QUIZ.length} /> }
    case "style":
      return { kicker: game(id).search, title: ["Which leadership style is ", "yours", "?"], size: "md", line: game(id).blurb, foot: quizFoot(id), narrow: true, body: <FirstQuestion {...STYLE_QUIZ[0]} keyOf="style-0" of={STYLE_QUIZ.length} /> }
    case "power":
      return { kicker: game(id).search, title: ["Where does your ", "power", " come from?"], size: "md", line: game(id).blurb, foot: quizFoot(id), narrow: true, body: <FirstQuestion {...POWER_QUIZ[0]} keyOf="power-0" of={POWER_QUIZ.length} /> }
    case "listen":
      return { kicker: game(id).search, title: ["What kind of ", "listener", " are you?"], size: "md", line: game(id).blurb, foot: quizFoot(id), narrow: true, body: <FirstQuestion {...LISTEN_QUIZ[0]} keyOf="listen-0" of={LISTEN_QUIZ.length} /> }

    case "values":
      return {
        kicker: game(id).search,
        title: ["What do you ", "value", "?"],
        size: "xl",
        line: game(id).blurb,
        foot: `Find yours · ${parseInt(game(id).minutes)} minute card sort`,
        body: (
          <div className="grid gap-5">
            <Ticks of={3} />
            <p className="font-serif text-[28px] leading-[1.15]">Pick the ten values that matter most to you.</p>
            <ValueChips />
          </div>
        ),
      }
    case "mirror":
      return {
        kicker: "Values mirror",
        title: ["What do ", "I", " value?"],
        size: "xl",
        line: "Pick the five you see in me, then see mine.",
        foot: "No sign-up",
        body: (
          <div className="grid gap-5">
            <p className="font-serif text-[28px] leading-[1.15]">Pick the five you see in me.</p>
            <ValueChips />
          </div>
        ),
      }

    case "job": {
      const at = (x: number) => `${((x - 1) / 6) * 100}%`
      return {
        kicker: game(id).search,
        title: ["Diagnose your ", "job", ""],
        size: "xl",
        line: game(id).blurb,
        foot: `Score yours · ${parseInt(game(id).minutes)} minute survey`,
        body: (
          <div className="grid gap-3">
            <CardLabel>Typical job, 1 to 7</CardLabel>
            <ul className="grid gap-4">
              {JDS_DIMS.map((name, k) => (
                <li key={name} className="grid gap-2">
                  <span className="text-[21px] leading-tight font-semibold">{name}</span>
                  <div className="relative mt-6 h-3 rounded-full bg-border">
                    <span className="absolute -inset-y-1.5 w-1 -translate-x-1/2 rounded-full bg-foreground" style={{ left: at(JDS_NORMS.mean[k]) }} />
                    <span className="absolute -top-7 -translate-x-1/2 text-[16px] whitespace-nowrap text-muted-foreground tnum" style={{ left: at(JDS_NORMS.mean[k]) }}>
                      {k === 0 ? `typical ${JDS_NORMS.mean[k].toFixed(1)}` : JDS_NORMS.mean[k].toFixed(1)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ),
      }
    }

    case "rewind": {
      const t = TALKS[0]
      const line = t.turns[0].lines.find((l) => l.grade === "costly")!
      return {
        kicker: game(id).search,
        title: ["", "Rewind", `: ${t.title.toLowerCase()}`],
        size: "lg",
        line: game(id).blurb,
        foot: `Play it · ${parseInt(game(id).minutes)} minutes`,
        body: (
          <ol className="grid gap-4 text-[19px] leading-snug">
            <li className="grid justify-items-start gap-1.5">
              <CardLabel>{t.them}</CardLabel>
              <p className="max-w-[88%] rounded-[20px] rounded-bl-md bg-muted px-5 py-3">{t.opener}</p>
            </li>
            <li className="grid justify-items-end gap-1.5">
              <CardLabel>You</CardLabel>
              <p className="max-w-[88%] rounded-[20px] rounded-br-md bg-foreground px-5 py-3 text-background">{line.says}</p>
              <div className="flex items-center gap-3 pt-1">
                <span className="flex items-center gap-2">
                  <span aria-hidden className="grid size-7 place-items-center rounded-full bg-foreground text-background">
                    <X className="size-4" strokeWidth={3} />
                  </span>
                  <span className="text-[17px] font-semibold">{GRADE_LABEL[line.grade]}</span>
                </span>
                <span className="inline-flex h-11 items-center gap-2 rounded-full border border-foreground/30 px-4 text-[17px] font-semibold">
                  <Undo2 className="size-5" /> Rewind
                </span>
              </div>
            </li>
            <li className="grid justify-items-start gap-1.5">
              <CardLabel>{t.them}</CardLabel>
              <p className="max-w-[88%] rounded-[20px] rounded-bl-md bg-muted px-5 py-3">{line.reply}</p>
            </li>
          </ol>
        ),
      }
    }

    case "network": {
      // The game's own picture of what you get (its intro): five contacts round you, a line wherever two know each other.
      const at = (k: number) => [180 + 104 * Math.cos(-Math.PI / 2 + (2 * Math.PI * k) / 5), 150 + 104 * Math.sin(-Math.PI / 2 + (2 * Math.PI * k) / 5)]
      const ties = [[0, 1], [1, 2], [3, 4]]
      return {
        kicker: game(id).search,
        title: ["Map your ", "network", ""],
        size: "xl",
        line: game(id).blurb,
        foot: `Map yours · ${parseInt(game(id).minutes)} minutes`,
        panel: "grid content-center px-6",
        body: (
          <svg viewBox="0 0 360 300" className="viz" role="img" aria-label="You in the middle, five contacts round you, a line wherever two of them know each other">
            {[0, 1, 2, 3, 4].map((k) => (
              <line key={k} x1={180} y1={150} x2={at(k)[0]} y2={at(k)[1]} className="grid-line" />
            ))}
            {ties.map(([a, b]) => (
              <line key={`${a}-${b}`} x1={at(a)[0]} y1={at(a)[1]} x2={at(b)[0]} y2={at(b)[1]} className="edge-ink" strokeWidth={1.6} />
            ))}
            <circle cx={180} cy={150} r={20} className="fill-signal" />
            <text x={180} y={154.5} textAnchor="middle" style={{ fill: "var(--signal-foreground)", fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 12, letterSpacing: 0 }}>
              You
            </text>
            {[0, 1, 2, 3, 4].map((k) => (
              <circle key={k} cx={at(k)[0]} cy={at(k)[1]} r={9} className="node" />
            ))}
          </svg>
        ),
      }
    }

    case "bounce":
      return {
        kicker: game(id).search,
        title: ["How fast do you ", "bounce", " back?"],
        size: "md",
        line: game(id).blurb,
        foot: `Score yours · ${parseInt(game(id).minutes)} minute survey`,
        narrow: true,
        body: (
          <div className="grid gap-5">
            <Ticks of={BRS_ITEMS.length} />
            <p className="font-serif text-[34px] leading-[1.15] text-balance">{BRS_ITEMS[0].q}</p>
            <div className="grid gap-2">
              {BRS_AGREE.map((a) => (
                <Choice key={a}>{a}</Choice>
              ))}
            </div>
          </div>
        ),
      }

    case "bias": {
      // One pitch from the game and four of its traps, as each round deals four.
      const pitch = BIAS_ITEMS.find((b) => b[1] === "Sunk cost")![0]
      const opts = ["Anchoring", "Sunk cost", "Groupthink", "Overconfidence"].filter((b) => BIAS_NAMES.includes(b))
      return {
        kicker: game(id).search,
        title: ["Bias ", "blitz", ""],
        size: "xl",
        line: game(id).blurb,
        foot: "Play it · 60 seconds",
        narrow: true,
        body: (
          <div className="grid gap-6">
            <div className="flex items-center gap-4">
              <div aria-hidden className="h-2 flex-1 rounded-full bg-foreground" />
              <span className="text-[17px] text-muted-foreground tnum">60s</span>
            </div>
            <CardLabel>Name the trap</CardLabel>
            <p className="font-serif text-[34px] leading-[1.15] text-balance">{pitch}</p>
            <div className="grid grid-cols-2 gap-2">
              {opts.map((o) => (
                <Choice key={o} className="min-h-14 justify-center font-semibold">
                  {o}
                </Choice>
              ))}
            </div>
          </div>
        ),
      }
    }

    case "climb": {
      // Three steps in: the climbed steps in ink and the latest in pink, as the game draws them, and the tiles dealt.
      const steps = fwById("kotter-8")!.rows.map((r) => r[0].replace(/^\d+ /, ""))
      const climbed = 3
      const tiles = seededOrder(steps.length, "climb-card")
      return {
        kicker: game(id).search,
        title: ["Kotter ", "climb", ""],
        size: "xl",
        line: game(id).blurb,
        foot: `Play it · ${parseInt(game(id).minutes)} minute`,
        narrow: true,
        body: (
          <div className="grid gap-5">
            <div className="flex items-end justify-between gap-4">
              <svg className="viz !mx-0 max-w-[300px] flex-1" viewBox="0 0 600 220" aria-hidden>
                {steps.map((_, i) => {
                  const x = 12 + i * 72,
                    y = 192 - i * 24
                  return <rect key={i} x={x} y={y} width={66} height={212 - y} rx={3} className={i < climbed ? (i === climbed - 1 ? "fill-signal" : "fill-ink") : "fill-soft"} />
                })}
                <line x1={4} x2={596} y1={212.5} y2={212.5} className="edge-ink" />
              </svg>
              <span className="text-[17px] text-muted-foreground tnum">{climbed} of 8</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {tiles.map((s) => {
                const placed = s < climbed
                return (
                  <div key={s} className={cn("grid min-h-[72px] content-between gap-1 rounded-[14px] border p-3 text-[17px] leading-tight font-semibold", placed ? "border-foreground bg-foreground text-background" : "border-border")}>
                    <span className={cn("text-[14px] font-medium", placed ? "text-background/70" : "text-muted-foreground")}>{placed ? `Step ${s + 1}` : "?"}</span>
                    {steps[s]}
                  </div>
                )
              })}
            </div>
          </div>
        ),
      }
    }

    /* The pages. */
    case "play":
      return {
        kicker: "The arcade",
        title: ["Learn leadership by ", "playing", ""],
        size: "md",
        line: "Each one built on a framework from the course.",
        foot: `${GAMES.length} games · free, no sign-up`,
        body: (
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5">
            {GAMES.map((g) => (
              <li key={g.id} className="grid gap-0.5 border-t border-border pt-2">
                <span className="text-[18px] leading-tight font-semibold">{g.search}</span>
                <span className="text-[15px] text-muted-foreground">{g.minutes}</span>
              </li>
            ))}
          </ul>
        ),
      }

    case "today":
      return {
        kicker: "Today’s call",
        title: ["One ", "call", "\na day"],
        size: "xl",
        line: "Make the call, say how sure you are, see what follows.",
        foot: "Same call for everyone today",
        panel: "grid gap-7",
        body: (
          <>
            <div className="grid gap-4">
              <ul className="grid gap-3">
                {(["strong", "tradeoff", "costly"] as Grade[]).map((g) => (
                  <li key={g} className="flex items-center gap-4 rounded-[14px] border border-border px-4 py-3">
                    <Mark g={g} />
                    <span className="text-[26px] font-semibold">{GRADE_LABEL[g]}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid gap-4">
              <CardLabel>How sure are you?</CardLabel>
              <ul className="flex flex-wrap gap-2">
                {SURE.map((s) => (
                  <li key={s} className="inline-flex h-12 items-center rounded-full border border-border px-5 text-[19px]">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </>
        ),
      }

    case "today-class": {
      const steps: [string, string][] = [
        ["Think", "Everyone decides alone"],
        ["Vote", "Hands up for each letter"],
        ["Talk", "Find someone who chose differently"],
        ["Vote again", "Changing your mind is allowed"],
        ["Reveal", "What follows, and how the room moved"],
      ]
      return {
        kicker: "Today’s call, with a room",
        title: ["Run it with a ", "room", ""],
        size: "xl",
        line: "Vote alone, talk it out, vote again.",
        foot: "Big type · full screen · nothing stored",
        body: (
          <ol className="relative grid gap-5">
            <span aria-hidden className="absolute top-3 bottom-3 left-[11px] w-0.5 bg-border" />
            {steps.map(([s, what], i) => (
              <li key={s} className="relative grid grid-cols-[24px_minmax(0,1fr)] items-start gap-5">
                <span className={cn("mt-1.5 size-6 rounded-full border-2 border-foreground", i === 0 ? "bg-foreground" : "bg-card")} />
                <span className="grid gap-0.5">
                  <span className="text-[26px] leading-tight font-semibold">{s}</span>
                  <span className="text-[19px] leading-snug text-muted-foreground">{what}</span>
                </span>
              </li>
            ))}
          </ol>
        ),
      }
    }

    case "practice": {
      const checks = SESSIONS.reduce((n, s) => n + s.checks.length, 0)
      const days = (d: number) => (d === 1 ? "1 day" : `${d} days`)
      return {
        kicker: "Practice",
        title: ["Make it ", "stick", ""],
        size: "xl",
        line: "Questions from all twenty-four lessons.",
        foot: `${checks} checks · ${FRAMEWORKS.length} frameworks`,
        panel: "grid gap-9",
        body: (
          <>
            <div className="grid gap-6">
              <CardLabel>A miss comes back</CardLabel>
              <Stops names={["Missed", ...REVIEW_GAPS.map(days), "Learned"]} filled={[0]} />
              <p className="text-[19px] leading-snug text-muted-foreground">Longer after each right answer. A miss starts over.</p>
            </div>
            <div className="grid gap-4">
              <ul className="flex flex-wrap gap-2">
                {["Review", "Drill", "Final test", "Which framework?", "Flashcards"].map((m) => (
                  <li key={m} className="inline-flex h-12 items-center rounded-full border border-border px-5 text-[19px]">
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          </>
        ),
      }
    }

    case "learn": {
      const parts: [string, number[]][] = []
      for (const s of SESSIONS) {
        const p = parts.find((x) => x[0] === s.part)
        if (p) p[1].push(s.n)
        else parts.push([s.part, [s.n]])
      }
      return {
        kicker: "The course",
        title: ["Twenty-four lessons, one ", "path", ""],
        size: "md",
        line: "Each with a model to move, a call to make and a check.",
        foot: "Free, no sign-up",
        body: (
          <ol className="relative grid gap-4">
            <span aria-hidden className="absolute top-3 bottom-3 left-[9px] w-0.5 bg-border" />
            {parts.map(([name, ns], i) => (
              <li key={name} className="relative grid grid-cols-[20px_minmax(0,1fr)] items-center gap-4">
                <span className={cn("size-5 rounded-full border-2 border-foreground", i === 0 ? "bg-foreground" : "bg-card")} />
                <span className="grid gap-1.5">
                  <span className="text-[21px] leading-tight font-semibold">{name}</span>
                  <span className="flex gap-1.5">
                    {ns.map((n) => (
                      <span key={n} className="size-3.5 rounded-full border-2 border-foreground/60" />
                    ))}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        ),
      }
    }

    case "frameworks": {
      const picks = ["kotter-8", "goleman-6", "psych-safety", "tki", "power-bases", "grow", "principled", "jcm"].map((x) => fwById(x)!)
      return {
        kicker: "Frameworks",
        title: [`${FRAMEWORKS.length} frameworks, `, "one", " page"],
        size: "lg",
        line: "From all twenty-four lessons.",
        foot: "Each with a page of its own",
        body: (
          <div className="grid gap-4">
            <ul className="grid">
              {picks.map((f) => (
                <li key={f.id} className="border-b border-border py-2.5 text-[19px] leading-snug font-semibold">
                  {frameworkHeading(f)}
                </li>
              ))}
            </ul>
            <p className="text-[19px] text-muted-foreground">and {FRAMEWORKS.length - picks.length} more</p>
          </div>
        ),
      }
    }

    case "built": {
      // The installed versions, read at build time as the How it's built page reads them.
      const v = (pkg: string) => (JSON.parse(readFileSync(`node_modules/${pkg}/package.json`, "utf8")).version as string).split(".").slice(0, 2).join(".")
      const stack: [string, string][] = [
        ["Next.js", "next"],
        ["React", "react"],
        ["React Compiler", "babel-plugin-react-compiler"],
        ["TypeScript", "typescript"],
        ["Tailwind CSS", "tailwindcss"],
      ]
      return {
        kicker: "The stack",
        title: ["How it’s ", "built", ""],
        size: "xl",
        line: "Open source tools, a small design system and a lot of checking.",
        foot: "No server · no accounts · no cookies",
        panel: "grid content-center",
        body: (
          <ul className="grid">
            {stack.map(([name, pkg]) => (
              <li key={name} className="flex items-baseline justify-between gap-4 border-b border-border py-4 text-[24px] last:border-b-0">
                <span className="font-semibold">{name}</span>
                <span className="text-muted-foreground tnum">{v(pkg)}</span>
              </li>
            ))}
          </ul>
        ),
      }
    }

    case "brand": {
      const swatches: [string, string, string][] = [
        ["Paper", "bg-background", COLORS.light.background],
        ["Card", "bg-card", COLORS.light.card],
        ["Ink", "bg-foreground", COLORS.light.foreground],
      ]
      return {
        kicker: "Brand",
        title: ["The mark, the name, the ", "voice", ""],
        size: "md",
        line: "Colour, type and every logo file.",
        foot: "Free kit · SVG and PNG",
        panel: "grid gap-8",
        body: (
          <>
            <div className="flex items-center gap-6">
              <LogoMark className="size-[120px]" />
              <Wordmark className="h-[34px]" />
            </div>
            <ul className="grid grid-cols-3 gap-3">
              {swatches.map(([name, bg, hex]) => (
                <li key={name} className="grid gap-2">
                  <span className={cn("h-16 rounded-[14px] border border-border", bg)} />
                  <span className="text-[18px] font-semibold">{name}</span>
                  <span className="text-[15px] text-muted-foreground tnum">{hex}</span>
                </li>
              ))}
            </ul>
            <div className="grid gap-1 border-t border-border pt-5">
              <span className="font-serif text-[34px] leading-tight">Noticia Text</span>
              <span className="text-[26px] leading-tight font-medium">Instrument Sans</span>
            </div>
          </>
        ),
      }
    }
  }
  return null
}

export function PageCard({ id }: { id: string }) {
  const c = card(id)
  if (!c) return null
  return (
    <ShareCard kicker={c.kicker} title={c.title} size={c.size} line={c.line} foot={c.foot} narrow={c.narrow} panel={c.panel}>
      {c.body}
    </ShareCard>
  )
}
