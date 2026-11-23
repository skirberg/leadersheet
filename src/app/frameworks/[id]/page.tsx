import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FrameworkTable } from "@/components/learn/framework-card"
import { FRAMEWORKS, SESSIONS, fwById, sheetNo } from "@/data/course"
import { lessonHref } from "@/lib/paths"
import { caseFor } from "@/data/cases"
import { BRAND } from "@/brand"
import { JsonLd } from "@/components/site/json-ld"
import { frameworkDescription, frameworkHeading, frameworkJsonLd, frameworkPath, frameworkSearchTitle, gamesForFramework, shareCard } from "@/lib/seo"

/*
  One page per framework. Each is a short, citable answer to "what is X": the framework in a line, its
  parts, the lesson where you can move it and make a call with it, and the readings it comes from.
*/
export const dynamicParams = false
export function generateStaticParams() {
  return FRAMEWORKS.map((f) => ({ id: f.id }))
}

const lessonOf = (n: number) => SESSIONS.find((s) => s.n === n)!

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const f = fwById(id)
  if (!f) return {}
  // Its own card (/og/framework/<id>/): the framework and its parts, not the lesson it sits in.
  return {
    title: frameworkSearchTitle(f),
    description: frameworkDescription(f),
    ...shareCard(`/og/framework-${f.id}.png`, { title: `${frameworkHeading(f)} · ${BRAND.name}`, description: f.one, type: "article" }),
  }
}

export default async function FrameworkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const f = fwById(id)
  if (!f) notFound()
  const s = lessonOf(f.s)
  const i = FRAMEWORKS.indexOf(f)
  const pv = FRAMEWORKS[i - 1],
    nx = FRAMEWORKS[i + 1]
  const sameLesson = FRAMEWORKS.filter((x) => x.s === f.s && x.id !== f.id)
  const samePart = FRAMEWORKS.filter((x) => x.s !== f.s && lessonOf(x.s).part === s.part).slice(0, 6)
  const cs = caseFor(s.id)
  const decides = cs?.fw === f.id
  // The quiz or tool that plays this framework, named the way people search for it ("Conflict style quiz").
  const games = gamesForFramework(f.id)

  return (
    // base-ui.com's page: what each part is in the rail (columns 1 to 3), the part itself from column 4 (DESIGN.md, Grid).
    <div className="page">
      <JsonLd data={frameworkJsonLd(f, s)} />
      <div className="span-wide grid grid-cols-subgrid gap-y-6">
      <nav aria-label="Breadcrumb" className="span-rail lg:pt-3">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          <li>
            <Link href="/frameworks/" className="underline-offset-4 hover:text-foreground hover:underline">
              Frameworks
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="size-3.5" />
          </li>
          <li aria-current="page" className="text-foreground">
            {f.name}
          </li>
        </ol>
      </nav>

      <header className="span-main grid gap-5 lg:max-w-cols-8 lg:row-start-1">
        {/* Scales down on the smallest phones: "transformational" is wider than a 320 px screen at 40 px. */}
        <h1 className="text-[min(40px,10vw)] leading-[1.05] sm:text-[56px]">{frameworkHeading(f)}</h1>
        <p className="text-2xl leading-[1.3] font-medium tracking-[-0.01em] sm:text-[26px]">{f.one}</p>
        <p className="text-base text-muted-foreground">
          {f.by} · Taught in lesson {s.n}, {s.title}
        </p>
      </header>
      </div>

      <section aria-labelledby="parts" className="span-wide grid grid-cols-subgrid gap-y-4">
        <h2 id="parts" className="span-rail text-2xl">
          The parts
        </h2>
        <div className="span-main rounded-2xl bg-card px-5 py-3 sm:px-6 lg:max-w-cols-8">
          <FrameworkTable f={f} />
        </div>
      </section>

      <section aria-labelledby="try" className="span-wide grid grid-cols-subgrid gap-y-4">
        <h2 id="try" className="span-rail text-2xl">
          Try it
        </h2>
        <div className="span-main grid gap-4 rounded-2xl bg-card p-5 sm:p-6 lg:max-w-cols-8">
          <p className="label-mono">
            {sheetNo(s.n)} · {s.part}
          </p>
          <p className="text-xl leading-snug font-semibold">{s.title}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button asChild>
              <Link href={`${lessonHref(s)}#see-it`}>
                Move the model <ArrowRight className="size-4" />
              </Link>
            </Button>
            {decides && (
              <Button asChild variant="outline">
                <Link href={`${lessonHref(s)}#your-call`}>Make the call</Link>
              </Button>
            )}
            {games.map((g) => (
              <Button key={g.id} asChild variant="outline">
                <Link href={`/play/${g.id}/`}>{g.search}</Link>
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="sources" className="span-wide grid grid-cols-subgrid gap-y-4">
        {/* The lesson's readings, not necessarily the framework's origin (the header credits that), so the heading says whose they are. */}
        <h2 id="sources" className="span-rail text-2xl">
          Readings in lesson {s.n}
        </h2>
        <ul className="span-read divide-y divide-border border-y border-border">
          {s.readings.map((r) => (
            <li key={r.t} className="grid gap-1 py-3">
              {r.url ? (
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1 font-semibold underline-offset-4 hover:underline">
                  {r.t}
                  <ArrowUpRight className="mt-1 size-3.5 shrink-0 text-muted-foreground" />
                </a>
              ) : (
                <span className="font-semibold">{r.t}</span>
              )}
              <span className="text-sm text-muted-foreground">
                {r.a} · {r.src}, {r.y}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {(sameLesson.length > 0 || samePart.length > 0) && (
        <section aria-labelledby="related" className="span-wide grid grid-cols-subgrid gap-y-4">
          <h2 id="related" className="span-rail text-2xl">
            Related frameworks
          </h2>
          <ul className="span-main grid gap-(--gutter) sm:grid-cols-2 lg:max-w-cols-8">
            {[...sameLesson, ...samePart].map((x) => (
              <li key={x.id}>
                <Link href={frameworkPath(x.id)} className="grid min-h-16 content-center gap-0.5 rounded-2xl bg-card px-5 py-3 press hover:bg-muted">
                  <span className="font-semibold">{x.name}</span>
                  <span className="text-sm text-muted-foreground">{x.by}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav aria-label="More frameworks" className="span-main grid grid-cols-2 gap-(--gutter) lg:max-w-cols-8">
        {pv ? (
          <Link href={frameworkPath(pv.id)} className="grid min-h-20 content-start gap-1 rounded-2xl bg-card px-5 py-4 press hover:bg-muted sm:px-6">
            <span className="label-mono inline-flex items-center gap-1">
              <ArrowLeft className="size-3" /> Previous
            </span>
            <span className="font-semibold">{pv.name}</span>
          </Link>
        ) : (
          <span />
        )}
        {nx ? (
          <Link href={frameworkPath(nx.id)} className="grid min-h-20 content-start justify-items-end gap-1 rounded-2xl bg-card px-5 py-4 text-right press hover:bg-muted sm:px-6">
            <span className="label-mono inline-flex items-center gap-1">
              Next <ArrowRight className="size-3" />
            </span>
            <span className="font-semibold">{nx.name}</span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  )
}
