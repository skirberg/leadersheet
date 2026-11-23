import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronDown } from "lucide-react"
import { Emphasis } from "@/components/brand/emphasis"
import { FrameworkCard } from "@/components/learn/framework-card"
import { SheetRail } from "@/components/learn/sheet-rail"
import { SeenMarker, SessionQuiz } from "@/components/learn/session-parts"
import { SessionLab } from "@/components/labs"
import { DecisionCase } from "@/components/learn/decision-case"
import { caseFor } from "@/data/cases"
import { PlayCallout } from "@/components/play/arcade"
import { SheetPlaySlot } from "@/components/play/home-bits"
import { SESSIONS, fwById, sessionBySlug, sheetNo } from "@/data/course"
import { lessonHref, lessonSlug } from "@/lib/paths"
import { BRAND } from "@/brand"
import { JsonLd } from "@/components/site/json-ld"
import { lessonJsonLd, lessonSearchTitle } from "@/lib/seo"

export const dynamicParams = false
export function generateStaticParams() {
  // The segment is the lesson's address (its title), not its storage id: see lib/paths.ts.
  return SESSIONS.map((s) => ({ id: lessonSlug(s.title) }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const s = sessionBySlug(id)
  if (!s) return {}
  // The tab and search result add the frameworks people search for; the share card keeps the lesson's own title.
  const title = lessonSearchTitle(s)
  const image = `/og/sheet-${s.id}.png`
  return {
    title,
    description: s.idea,
    openGraph: { title: `${s.title} · ${BRAND.name}`, description: s.idea, url: "./", siteName: BRAND.name, type: "article", images: [{ url: image, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", images: [image] },
  }
}

function Section({ no, title, id, children }: { no: string; title: string; id: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="grid min-w-0 scroll-mt-24 gap-5">
      <div data-no={no}>
        <h2 id={id} className="text-2xl">
          {title}
        </h2>
      </div>
      {children}
    </section>
  )
}

const EMPHASIS: Record<string, string> = {
  s1: "what they build",
  s2: "the safety they create",
  s3: "no best structure",
  s4: "how people behave",
  s5: "predictable steps",
  s6: "never fully resolve",
  s7: "meaning and identity",
  s8: "your own biases",
  s9: "the urge to judge",
  s10: "mastery and meaning",
  s11: "conclusions, not data",
  s12: "Energy is renewable",
  s13: "not from your title",
  s14: "switch among several",
  s15: "add less than they claim",
  s16: "not only the outcome",
  s17: "failing to see the ethics",
  s18: "interests, options and their own walk-away point",
  s19: "asking more than telling",
  s20: "people you barely know",
  s21: "relative positions",
  s22: "know when to stop",
  s23: "makes speaking up safe",
  s24: "check your week against it",
}

// Frameworks whose every row the lesson's model already shows (a checklist, a ladder, a set of steps). Their card
// keeps the name and one line and links to the full page, so the lesson does not print the same rows twice.
const SHOWN_IN_MODEL = new Set(["nine-tests", "conger-4", "k12", "ladder", "five-flaws"])

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const s = sessionBySlug(id)
  if (!s) notFound()
  const i = SESSIONS.indexOf(s)
  const pv = SESSIONS[i - 1],
    nx = SESSIONS[i + 1]
  const fws = s.fw.map(fwById).filter((f): f is NonNullable<typeof f> => !!f)
  const cs = caseFor(s.id)
  // The phrase that carries each idea, chosen by hand, not the last three words.
  const key = EMPHASIS[s.id]
  const at = key ? s.idea.indexOf(key) : -1
  const head = at >= 0 ? s.idea.slice(0, at) : s.idea,
    tail = at >= 0 ? key : "",
    rest = at >= 0 ? s.idea.slice(at + key.length) : ""

  return (
    // The lesson list in the rail (columns 1 to 3), the lesson from column 4 across eight columns: the width its models
    // were drawn for, with the twelfth column left as margin (DESIGN.md, Grid).
    <div className="page">
      <JsonLd data={lessonJsonLd(s)} />
      <SeenMarker id={s.id} />
      <aside aria-label="All lessons" className="span-rail hidden lg:block">
        <div className="sticky top-24 grid gap-3">
          <SheetRail currentId={s.id} />
        </div>
      </aside>

      <article className="span-main grid min-w-0 gap-14 lg:max-w-cols-8">
          <header className="grid gap-6">
            <Link href="/learn/" className="label-mono inline-flex w-fit items-center gap-1.5 hover:text-foreground -my-3 py-3 lg:hidden">
              <ArrowLeft className="size-3.5" /> All lessons
            </Link>
            <h1 className="text-[42px] leading-[1] sm:text-[60px]">{s.title}</h1>
            <p className="text-2xl leading-[1.25] font-medium tracking-[-0.01em] sm:text-[28px]">
              {head}{tail && <Emphasis delay={500}>{tail}</Emphasis>}{rest}
            </p>
            <p className="label-mono">
              Lesson {s.n} of {SESSIONS.length} · {s.part}
            </p>
          </header>

          {/* The model comes first: a learner moves the idea before reading about it. */}
          <Section no="01" title="See it" id="see-it">
            <SheetPlaySlot slot="top">
              <PlayCallout sheet={s.id} />
            </SheetPlaySlot>
            <SessionLab lab={s.lab} />
            <SheetPlaySlot slot="bottom">
              <PlayCallout sheet={s.id} />
            </SheetPlaySlot>
          </Section>

          {/* Then a decision to make with it: the choice lands on the framework and, where it can, moves the model. */}
          {cs && (
            <Section no="02" title="Your call" id="your-call">
              <DecisionCase c={cs} />
            </Section>
          )}

          <Section no="03" title="Readings" id="readings">
            <div className="grid gap-4">
              {s.readings.map((r) => (
                <div key={r.t} className="grid gap-3 rounded-2xl bg-card p-5 sm:p-6">
                  <p className="label-mono">
                    {r.a} · {r.src}, {r.y}
                  </p>
                  <h3 className="text-xl leading-tight font-semibold">
                    {r.url ? (
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1 underline-offset-4 hover:underline">
                        {r.t}
                        <ArrowUpRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
                      </a>
                    ) : (
                      r.t
                    )}
                  </h3>
                  <p className="t-read">{r.idea}</p>
                  {/* The key line shows; the points wait behind a native disclosure, so the page reads short and nothing is lost. */}
                  <details className="group/pts">
                    <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline [&::-webkit-details-marker]:hidden">
                      <ChevronDown aria-hidden className="size-4 transition-transform group-open/pts:rotate-180" />
                      Key points
                    </summary>
                    <ul className="grid gap-2 pt-1 text-base">
                      {r.points.map((p) => (
                        <li key={p} className="flex gap-3">
                          <span aria-hidden className="mt-2.5 block h-px w-3 shrink-0 bg-foreground/60" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
              ))}
            </div>
          </Section>

          {fws.length > 0 && (
            <Section no="04" title="Frameworks" id="frameworks">
              <div className="grid gap-4">
                {fws.map((f) => (
                  <FrameworkCard key={f.id} f={f} href={`/frameworks/${f.id}/`} rows={!SHOWN_IN_MODEL.has(f.id)} />
                ))}
              </div>
            </Section>
          )}

          <Section no="05" title="Check yourself" id="check">
            <SessionQuiz s={s} />
          </Section>

          <nav aria-label="More sheets" className="grid grid-cols-2 gap-3">
            {pv ? (
              <Link href={lessonHref(pv)} className="grid min-h-20 content-start gap-1 rounded-2xl bg-card px-5 py-4 press hover:bg-muted sm:px-6">
                <span className="label-mono inline-flex items-center gap-1">
                  <ArrowLeft className="size-3" /> {sheetNo(pv.n)}
                </span>
                <span className="font-semibold">{pv.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {nx ? (
              <Link href={lessonHref(nx)} className="grid min-h-20 content-start justify-items-end gap-1 rounded-2xl bg-card px-5 py-4 text-right press hover:bg-muted sm:px-6">
                <span className="label-mono inline-flex items-center gap-1">
                  {sheetNo(nx.n)} <ArrowRight className="size-3" />
                </span>
                <span className="font-semibold">{nx.title}</span>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </article>
    </div>
  )
}
