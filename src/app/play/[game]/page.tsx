import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { GAMES, type GameId } from "@/data/games"
import { GameView } from "./game-view"

export const dynamicParams = false
export function generateStaticParams() {
  return GAMES.map((g) => ({ game: g.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ game: string }> }): Promise<Metadata> {
  const { game } = await params
  const g = GAMES.find((x) => x.id === game)
  return g ? { title: g.title, description: g.blurb } : {}
}

export default async function GamePage({ params }: { params: Promise<{ game: string }> }) {
  const { game } = await params
  const g = GAMES.find((x) => x.id === game)
  if (!g) notFound()
  const others = GAMES.filter((x) => x.id !== g.id)
  return (
    <div className="mx-auto grid max-w-[960px] gap-8 px-4 pt-8 sm:px-6 lg:pt-12">
      <Link href="/play/" className="label-mono inline-flex w-fit items-center gap-1.5 hover:text-foreground">
        <ArrowLeft className="size-3.5" /> The arcade
      </Link>
      <GameView id={g.id as GameId} />
      <nav aria-label="More games" className="grid gap-3 border-t border-border pt-6 sm:grid-cols-3">
        {others.map((o) => (
          <Link key={o.id} href={`/play/${o.id}/`} className="corners grid gap-1 border border-border bg-card px-4 py-3 transition-colors hover:border-foreground/70">
            <span className="label-mono">{o.kind}</span>
            <span className="font-semibold">{o.title}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
