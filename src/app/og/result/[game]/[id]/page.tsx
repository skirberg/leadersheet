import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Wordmark } from "@/brand"
import { Emphasis } from "@/components/brand/emphasis"
import { ResultVisual } from "@/components/play/games"
import { RESULT_GAMES, SPREAD, type ResultGame, allResults, resultKey, resultSlug } from "@/data/results"
import { cn } from "@/lib/utils"
import { GAMES } from "@/data/games"

// Source for public/og/<game>-<id>.png (scripts/make-og.ts). Not linked anywhere and not indexed.
export const metadata: Metadata = { title: "Result card", robots: { index: false, follow: false } }
export const dynamicParams = false
export function generateStaticParams() {
  return allResults().map((r) => ({ game: r.game, id: resultSlug(r.key) }))
}

export default async function ResultCard({ params }: { params: Promise<{ game: string; id: string }> }) {
  const { game, id } = await params
  const g = RESULT_GAMES[game as ResultGame]
  const key = g && resultKey(game as ResultGame, id)
  if (!g || !key) notFound()
  const [pre, word, post] = g.heading(key)
  const play = GAMES.find((x) => x.id === game)
  return (
    <div className="fixed inset-0 z-[100] bg-background">
      <div className="relative grid h-[630px] w-[1200px] grid-cols-[560px_1fr] items-center gap-10 p-14">
        <div className="flex h-full flex-col justify-between">
          <Wordmark className="h-[30px] self-start" />
          <div className="grid gap-5">
            <p className="text-[24px] text-muted-foreground">{g.question}</p>
            {/* The text column is 560px wide: a twelve or thirteen letter result (Accommodating) at 84px runs under the chart. */}
            {/* The leading comes after the size: tailwind-merge drops a leading class that comes before a text size. */}
            <p className={cn("font-serif", (pre + word).length >= 12 ? "text-[72px]" : "text-[84px]", "leading-[1.02]")}>
              {pre}
              <Emphasis delay={0}>{word}</Emphasis>
              {post && (
                <>
                  <br />
                  {post.trim()}
                </>
              )}
            </p>
            <p className="text-[24px] leading-snug text-pretty text-muted-foreground">{g.desc(key)}</p>
          </div>
          {/* One text node, so a card's page reads exactly as it did before the test added a second kind. */}
          <p className="text-[22px] text-muted-foreground">{`Find yours · ${parseInt(play?.minutes ?? "2")} minute ${play?.kind === "Test" ? "test" : "quiz"}`}</p>
        </div>
        <div className="rounded-[40px] bg-card p-8">
          <ResultVisual game={game as ResultGame} top={key === SPREAD ? undefined : key} card />
        </div>
      </div>
    </div>
  )
}
