import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Emphasis } from "@/components/brand/emphasis"
import { ResultVisual } from "@/components/play/games"
import { RESULT_GAMES, SPREAD, type ResultGame, allResults, resultImage, resultKey, resultPath, resultSlug } from "@/data/results"
import { sessionById, sheetNo } from "@/data/course"
import { lessonHref } from "@/lib/paths"
import { BRAND } from "@/brand"
import { cn } from "@/lib/utils"

export const dynamicParams = false
export function generateStaticParams() {
  return allResults().map((r) => ({ game: r.game, result: resultSlug(r.key) }))
}

type P = { params: Promise<{ game: string; result: string }> }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { game, result } = await params
  const g = RESULT_GAMES[game as ResultGame]
  const key = g && resultKey(game as ResultGame, result)
  if (!g || !key) return {}
  const title = `${g.label(key)} · ${g.question}`
  return {
    title,
    description: g.desc(key),
    openGraph: { title, description: g.desc(key), url: "./", siteName: BRAND.name, images: [{ url: resultImage(game as ResultGame, key), width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", images: [resultImage(game as ResultGame, key)] },
  }
}

export default async function ResultPage({ params }: P) {
  const { game: gameId, result } = await params
  const game = gameId as ResultGame
  const g = RESULT_GAMES[game]
  const key = g && resultKey(game, result)
  if (!g || !key) notFound()
  const sheet = sessionById(g.sheet)!
  const [pre, word, post] = g.heading(key)
  return (
    <div className="page">
      <div className="span-wide grid grid-cols-subgrid gap-y-6">
      <div className="span-rail">
        <Link href="/play/" className="label-mono inline-flex w-fit items-center gap-1.5 hover:text-foreground -my-3 py-3">
          <ArrowLeft className="size-3.5" /> The arcade
        </Link>
      </div>
      <section className="span-main grid gap-8 rounded-2xl bg-card p-5 sm:p-8 lg:grid-cols-2 lg:items-center">
        <div className="grid content-start gap-4">
          <p className="label-mono">{g.question}</p>
          {/* Scales down on the smallest phones: "Accommodating" is wider than a 320 px screen at 40 px. */}
          <h1 className="text-[min(40px,11.25vw)] leading-[1] sm:text-5xl">
            {pre}
            <Emphasis delay={150}>{word}</Emphasis>
            {post}
          </h1>
          <p className="text-lg text-pretty text-muted-foreground">{g.desc(key)}</p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button asChild size="lg">
              <Link href={`/play/${game}/`}>
                Find yours <ArrowRight className="size-4" />
              </Link>
            </Button>
            {!g.lessons && (
              <Button asChild size="lg" variant="outline">
                <Link href={lessonHref(sheet)}>{sheetNo(sheet.n)}</Link>
              </Button>
            )}
          </div>
          {g.lessons && (
            <div className="grid gap-1 border-t border-border pt-4">
              <p className="text-sm text-muted-foreground">Lessons that help</p>
              {g.lessons(key).map((id) => {
                const s = sessionById(id)!
                return (
                  <Link key={id} href={lessonHref(s)} className="inline-flex min-h-11 w-fit items-center text-xl font-semibold underline-offset-4 hover:underline">
                    {s.n}. {s.title}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
        <ResultVisual game={game} top={key === SPREAD ? undefined : key} />
      </section>
      </div>
      <nav aria-label={g.all} className="span-main grid gap-3">
        <p className="label-mono">{g.all}</p>
        <ul className="flex flex-wrap gap-2">
          {g.styles.map((k) => (
            <li key={k}>
              <Link
                href={resultPath(game, k)}
                aria-current={k === key ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-full border border-border bg-card px-4 text-sm transition-colors hover:border-foreground/60",
                  k === key && "border-foreground bg-foreground font-semibold text-background hover:border-foreground"
                )}
              >
                {k}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <p className="span-main text-xs text-muted-foreground">{g.note}</p>
    </div>
  )
}
