"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PencilUnderline } from "@/components/brand/pencil"
import { Arcade } from "./arcade"
import { useProgress } from "@/lib/store"

export function HeroLine() {
  const { mode, ready } = useProgress()
  const play = ready && mode === "play"
  return (
    <>
      Every LiO idea, built so you can{" "}
      <PencilUnderline key={play ? "p" : "s"} delay={play ? 100 : 700}>
        {play ? "play it." : "move it."}
      </PencilUnderline>
    </>
  )
}

export function HeroCtas({ children }: { children: React.ReactNode }) {
  const { mode, ready } = useProgress()
  if (ready && mode === "play")
    return (
      <>
        <Button asChild size="lg">
          <Link href="/play/">
            Open the arcade <ArrowRight className="size-4" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="#this-week">This week</Link>
        </Button>
      </>
    )
  return <>{children}</>
}

export function HomeArcade({ slot }: { slot: "top" | "bottom" }) {
  const { mode, ready } = useProgress()
  const play = ready && mode === "play"
  if ((slot === "top") !== play) return null
  return (
    <section aria-labelledby={`arcade-${slot}`} className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-foreground pb-3">
        <div>
          <p className="label-mono">{play ? "Play mode" : "Take a break"}</p>
          <h2 id={`arcade-${slot}`} className="mt-1 text-3xl font-semibold tracking-[-0.02em]">
            The arcade
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Two quick quizzes about you, two games against the clock.</p>
        </div>
        <Link href="/play/" className="text-sm font-semibold underline-offset-4 hover:underline">
          All games
        </Link>
      </div>
      <Arcade />
    </section>
  )
}

export function SheetPlaySlot({ sheet, slot, children }: { sheet: string; slot: "top" | "bottom"; children: React.ReactNode }) {
  const { mode, ready } = useProgress()
  const play = ready && mode === "play"
  if ((slot === "top") !== play) return null
  return <>{children}</>
}
