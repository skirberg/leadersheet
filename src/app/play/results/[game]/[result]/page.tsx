import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Emphasis } from "@/components/brand/emphasis"
import { ConflictChart, CultureMapResult } from "@/components/play/games"
import { RESULT_GAMES, type ResultGame, allResults, resultImage, resultKey, resultPath, resultSlug } from "@/data/results"
import { sessionById, sheetNo } from "@/data/course"
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
    openGraph: { title, description: g.desc(key), images: [{ url: resultImage(game as ResultGame, key), width: 1200, height: 630 }] },
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
  return (
    <div className="mx-auto grid max-w-[1000px] gap-10 px-4 pt-8 sm:px-6 lg:pt-12">
      <Link href="/play/" className="label-mono inline-flex w-fit items-center gap-1.5 hover:text-foreground">
        <ArrowLeft className="size-3.5" /> The arcade
      </Link>
      <section className="corners grid gap-8 border border-border bg-card p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center">
        <div className="grid content-start gap-4">
          <p className="label-mono">{g.question}</p>
          <h1 className="text-[40px] leading-[1] font-semibold tracking-[-0.035em] sm:text-5xl">
            <Emphasis delay={150}>{key}</Emphasis>
            {g.suffix && ` ${g.suffix}`}
          </h1>
          <p className="text-lg text-muted-foreground">{g.desc(key)}</p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button asChild size="lg">
              <Link href={`/play/${game}/`}>
                Find yours <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={`/learn/${sheet.id}/`}>Sheet {sheetNo(sheet.n)}</Link>
            </Button>
          </div>
        </div>
        {game === "culture" ? <CultureMapResult top={key} /> : <ConflictChart top={key} />}
      </section>
      <nav aria-label={`All ${game === "culture" ? "cultures" : "styles"}`} className="grid gap-3">
        <p className="label-mono">{game === "culture" ? "All eight cultures" : "All five styles"}</p>
        <ul className="flex flex-wrap gap-2">
          {g.keys.map((k) => (
            <li key={k}>
              <Link
                href={resultPath(game, k)}
                aria-current={k === key ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-10 items-center rounded-full border border-border bg-card px-4 text-sm transition-colors hover:border-foreground/60",
                  k === key && "border-foreground bg-foreground font-semibold text-background hover:border-foreground"
                )}
              >
                {k}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <p className="text-xs text-muted-foreground">For fun, not a validated assessment.</p>
    </div>
  )
}
