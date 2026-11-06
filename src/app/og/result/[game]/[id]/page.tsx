import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Wordmark } from "@/brand"
import { Emphasis } from "@/components/brand/emphasis"
import { ConflictChart, CultureMapResult } from "@/components/play/games"
import { RESULT_GAMES, type ResultGame, allResults, resultKey, resultSlug } from "@/data/results"

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
  return (
    <div className="fixed inset-0 z-[100] bg-background">
      <div className="relative grid h-[630px] w-[1200px] grid-cols-[560px_1fr] items-center gap-10 p-14">
        <div className="flex h-full flex-col justify-between">
          <Wordmark className="h-[30px] self-start" />
          <div className="grid gap-5">
            <p className="text-[24px] text-muted-foreground">{g.question}</p>
            <p className="font-serif text-[84px] leading-[1.02]">
              <Emphasis delay={0}>{key}</Emphasis>
              {g.suffix && (
                <>
                  <br />
                  {g.suffix}
                </>
              )}
            </p>
            <p className="text-[24px] leading-snug text-muted-foreground">{g.desc(key)}</p>
          </div>
          <p className="text-[22px] text-muted-foreground">Find yours · 2 minute quiz</p>
        </div>
        <div className="rounded-[40px] bg-card p-8">
          {game === "culture" ? <CultureMapResult top={key} className="max-w-none" /> : <ConflictChart top={key} className="max-w-none" />}
        </div>
      </div>
    </div>
  )
}
