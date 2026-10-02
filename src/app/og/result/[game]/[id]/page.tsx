import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { BRAND, LogoMark } from "@/brand"
import { Emphasis } from "@/components/brand/emphasis"
import { ConflictChart, CultureMapResult } from "@/components/play/games"
import { RESULT_GAMES, type ResultGame, allResults, resultKey, resultSlug } from "@/data/results"

// Source for public/og/<game>-<id>.png (scripts/make-og.mjs). Not linked anywhere and not indexed.
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
      <div className="drafting-grid absolute inset-0" />
      <div className="relative grid h-[630px] w-[1200px] grid-cols-[560px_1fr] items-center gap-10 p-14">
        <div className="flex h-full flex-col justify-between">
          <span className="flex items-center gap-3">
            <LogoMark className="size-11" />
            <span className="text-[28px] font-bold tracking-[-0.03em]">{BRAND.name}</span>
          </span>
          <div className="grid gap-5">
            <p className="label-mono !text-[17px]">{g.question}</p>
            <p className="text-[80px] leading-[0.98] font-semibold tracking-[-0.04em]">
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
          <p className="label-mono !text-[15px]">Find yours · 2 minute quiz</p>
        </div>
        <div className="corners border border-border bg-card p-6">
          {game === "culture" ? <CultureMapResult top={key} className="max-w-none" /> : <ConflictChart top={key} className="max-w-none" />}
        </div>
      </div>
    </div>
  )
}
