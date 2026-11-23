import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { GAMES, type GameId } from "@/data/games"
import { GameView } from "./game-view"
import { FirstUse } from "@/components/site/first-use"
import { JsonLd } from "@/components/site/json-ld"
import { fwById, sessionById } from "@/data/course"
import { lessonHref } from "@/lib/paths"
import { GAME_SEARCH, abs, breadcrumbs, frameworkHeading, frameworkPath, lessonSearchTitle, shareCard } from "@/lib/seo"

export const dynamicParams = false
export function generateStaticParams() {
  return GAMES.map((g) => ({ game: g.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ game: string }> }): Promise<Metadata> {
  const { game } = await params
  const g = GAMES.find((x) => x.id === game)
  if (!g) return {}
  // The tab and the search result say what people search for ("Leadership style quiz"). Every game has its own share
  // card (/og/card/<id>/), which shows the game's own line; Team math and the decide test also keep it as the link's title.
  const q = GAME_SEARCH[g.id]
  return {
    title: q.title,
    description: q.description,
    ...shareCard(`/og/${g.id}.png`, OWN_LINE.has(g.id) ? { title: g.title, description: g.blurb } : {}),
  }
}

const OWN_LINE = new Set<string>(["team", "decide"])

export default async function GamePage({ params }: { params: Promise<{ game: string }> }) {
  const { game } = await params
  const g = GAMES.find((x) => x.id === game)
  if (!g) notFound()
  const others = GAMES.filter((x) => x.id !== g.id)
  const q = GAME_SEARCH[g.id]
  const fw = q.fw ? fwById(q.fw) : undefined
  const s = sessionById(g.sheet)
  return (
    // The game in the main column; the way back and where it comes from in the rail beside it (DESIGN.md, Grid). On a
    // phone they stack: the way back, the game, then its sources.
    <div className="page">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "LearningResource",
              name: q.title,
              alternateName: g.title,
              description: q.description,
              url: abs(`/play/${g.id}/`),
              learningResourceType: g.kind,
              inLanguage: "en",
              isAccessibleForFree: true,
              ...(fw && { about: { "@type": "DefinedTerm", name: frameworkHeading(fw), url: abs(frameworkPath(fw.id)) } }),
              ...(s && { isPartOf: { "@type": "LearningResource", name: lessonSearchTitle(s), url: abs(lessonHref(s)) } }),
            },
            breadcrumbs([["Home", "/"], ["Play", "/play/"], [g.title, `/play/${g.id}/`]]),
          ],
        }}
      />
      {/* At 1024 px the game spans both rows beside the rail; the second row takes the slack, so the sources sit right
          under the way back instead of halfway down. */}
      <div className="span-wide grid grid-cols-subgrid gap-y-6 lg:grid-rows-[auto_1fr]">
        <div className="span-rail lg:row-start-1">
          <Link href="/play/" className="label-mono inline-flex w-fit items-center gap-1.5 hover:text-foreground -my-3 py-3">
            <ArrowLeft className="size-3.5" /> The arcade
          </Link>
        </div>
        {/* The game draws its title as the card's h2 once it loads; the page's own heading is in the HTML from the start. */}
        <div className="span-main min-w-0 lg:row-span-2 lg:row-start-1 lg:max-w-cols-8">
          <h1 className="sr-only">{q.title}</h1>
          <FirstUse event="Game played" props={{ game: g.id }}>
            <GameView id={g.id as GameId} />
          </FirstUse>
        </div>
        {/* Where the game comes from, as plain links: the framework it plays and the lesson that teaches it. */}
        {s && (
          <p className="span-rail text-base text-muted-foreground lg:row-start-2">
          {fw && (
            <>
              Built on{" "}
              <Link href={frameworkPath(fw.id)} className="font-semibold text-foreground underline-offset-4 hover:underline">
                {frameworkHeading(fw)}
              </Link>
              .{" "}
            </>
          )}
          Taught in lesson {s.n},{" "}
          <Link href={lessonHref(s)} className="font-semibold text-foreground underline-offset-4 hover:underline">
            {s.title}
          </Link>
          .
        </p>
        )}
      </div>
      <nav aria-label="More games" className="span-main grid gap-(--gutter) border-t border-border pt-6 sm:grid-cols-2 lg:grid-cols-3">
        {others.map((o) => (
          <Link key={o.id} href={`/play/${o.id}/`} className="flex min-h-12 items-center rounded-2xl bg-card px-4 py-3 font-semibold press hover:bg-muted">
            {o.search}
          </Link>
        ))}
      </nav>
    </div>
  )
}
