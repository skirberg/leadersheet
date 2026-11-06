import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react"
import { Emphasis } from "@/components/brand/emphasis"
import { FrameworkCard } from "@/components/learn/framework-card"
import { SheetRail } from "@/components/learn/sheet-rail"
import { DueChecklist, SeenMarker, SessionQuiz } from "@/components/learn/session-parts"
import { ClassOnly } from "@/components/learn/class-only"
import { SessionLab } from "@/components/labs"
import { PlayCallout } from "@/components/play/arcade"
import { SheetPlaySlot } from "@/components/play/home-bits"
import { SESSIONS, fmt, fwById, sessionById, sheetNo } from "@/data/course"
import { BRAND } from "@/brand"

export const dynamicParams = false
export function generateStaticParams() {
  return SESSIONS.map((s) => ({ id: s.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const s = sessionById(id)
  if (!s) return {}
  const title = s.title
  const image = `/og/sheet-${s.id}.png`
  return {
    title,
    description: s.idea,
    openGraph: { title: `${title} · ${BRAND.name}`, description: s.idea, url: "./", siteName: BRAND.name, type: "article", images: [{ url: image, width: 1200, height: 630 }] },
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
}

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const s = sessionById(id)
  if (!s) notFound()
  const i = SESSIONS.indexOf(s)
  const pv = SESSIONS[i - 1],
    nx = SESSIONS[i + 1]
  const fws = s.fw.map(fwById).filter((f): f is NonNullable<typeof f> => !!f)
  // The phrase that carries each idea, chosen by hand, not the last three words.
  const key = EMPHASIS[s.id]
  const at = key ? s.idea.indexOf(key) : -1
  const head = at >= 0 ? s.idea.slice(0, at) : s.idea,
    tail = at >= 0 ? key : "",
    rest = at >= 0 ? s.idea.slice(at + key.length) : ""

  return (
    <div className="mx-auto max-w-[1240px] px-4 pt-8 sm:px-6 lg:pt-12">
      <SeenMarker id={s.id} />
      <div className="grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-14">
        <aside aria-label="All lessons" className="hidden lg:block">
          <div className="sticky top-24 grid gap-3">
            <SheetRail currentId={s.id} />
          </div>
        </aside>

        <article className="grid max-w-[800px] min-w-0 gap-14">
          <header className="grid gap-6">
            <Link href="/learn/" className="label-mono inline-flex w-fit items-center gap-1.5 hover:text-foreground lg:hidden">
              <ArrowLeft className="size-3.5" /> All lessons
            </Link>
            <h1 className="text-[42px] leading-[1] sm:text-[60px]">{s.title}</h1>
            <p className="text-2xl leading-[1.25] font-medium tracking-[-0.01em] sm:text-[28px]">
              {head}{tail && <Emphasis delay={500}>{tail}</Emphasis>}{rest}
            </p>
            {/* The model is the point of the sheet; on a phone it would otherwise sit below the film and the readings. */}
            <p className="text-[15px] text-muted-foreground">
              Lesson {s.n} of 12 · {s.part}
            </p>
            <a href="#see-it" className="label-mono inline-flex w-fit items-center gap-1.5 border-b border-foreground pb-0.5 text-foreground hover:text-muted-foreground">
              Try the model <ArrowDown className="size-3.5" />
            </a>
          </header>


          <Section no="01" title="Readings" id="readings">
            <div className="grid gap-4">
              {s.readings.map((r) => (
                <div key={r.t} className="grid gap-3 rounded-xl bg-card p-5 sm:p-6">
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
                  <p className="text-[17px] font-medium">{r.idea}</p>
                  <ul className="grid gap-2 text-[15px] text-muted-foreground">
                    {r.points.map((p) => (
                      <li key={p} className="flex gap-3">
                        <span aria-hidden className="mt-2.5 block h-px w-3 shrink-0 bg-foreground/60" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <dl className="grid gap-2 text-[15px] sm:grid-cols-[8rem_minmax(0,1fr)]">
              {s.videos.length > 0 && (
                <ClassOnly>
                  <dt className="label-mono pt-1">Videos</dt>
                  <dd className="text-muted-foreground">{s.videos.join(", ")}.</dd>
                </ClassOnly>
              )}
              {s.caseName && (
                <>
                  <dt className="label-mono pt-1">Case</dt>
                  <dd>
                    {s.caseName} <span className="text-muted-foreground">({s.caseBy})</span>
                  </dd>
                </>
              )}
              {s.exercise && (
                <ClassOnly>
                  <dt className="label-mono pt-1">In class</dt>
                  <dd>{s.exercise}</dd>
                </ClassOnly>
              )}
              {s.lab2 && (
                <ClassOnly>
                  <dt className="label-mono pt-1">Lab</dt>
                  <dd>{s.lab2}</dd>
                </ClassOnly>
              )}
            </dl>
          </Section>

          <Section no="02" title="See it" id="see-it">
            <SheetPlaySlot sheet={s.id} slot="top">
              <PlayCallout sheet={s.id} />
            </SheetPlaySlot>
            <SessionLab lab={s.lab} />
            <SheetPlaySlot sheet={s.id} slot="bottom">
              <PlayCallout sheet={s.id} />
            </SheetPlaySlot>
          </Section>

          {fws.length > 0 && (
            <Section no="03" title="Frameworks" id="frameworks">
              <div className="grid gap-4">
                {fws.map((f) => (
                  <FrameworkCard key={f.id} f={f} />
                ))}
              </div>
            </Section>
          )}

          <Section no="04" title="Check yourself" id="check">
            <SessionQuiz s={s} />
          </Section>

          <Section no="05" title="Think it through" id="bring">
            <ol className="grid gap-3">
              {s.prompts.map((p, k) => (
                <li key={p} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-2 border-l-2 border-foreground bg-card py-3 pr-4 pl-4 text-[17px]">
                  <span className="font-mono text-xs leading-7 text-muted-foreground tnum">P{k + 1}</span>
                  {p}
                </li>
              ))}
            </ol>
          </Section>

          <ClassOnly>
            <Section no="06" title={`Due before ${fmt(s.date)}`} id="due">
              <DueChecklist s={s} />
            </Section>
          </ClassOnly>

          <nav aria-label="More sheets" className="grid grid-cols-2 gap-3">
            {pv ? (
              <Link href={`/learn/${pv.id}/`} className="rounded-2xl grid min-h-20 content-center gap-1 bg-card px-4 py-3 press hover:border-foreground/70">
                <span className="label-mono inline-flex items-center gap-1">
                  <ArrowLeft className="size-3" /> {sheetNo(pv.n)}
                </span>
                <span className="font-semibold">{pv.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {nx ? (
              <Link href={`/learn/${nx.id}/`} className="rounded-2xl grid min-h-20 content-center justify-items-end gap-1 bg-card px-4 py-3 text-right press hover:border-foreground/70">
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
    </div>
  )
}
