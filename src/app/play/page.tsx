import type { Metadata } from "next"
import { Arcade } from "@/components/play/arcade"

export const metadata: Metadata = { title: "Play", description: "Quizzes and games built on classic leadership frameworks." }

export default function PlayPage() {
  return (
    <div className="mx-auto grid max-w-[1240px] gap-8 px-4 pt-10 sm:px-6 lg:pt-14">
      <div className="grid gap-2 border-b border-foreground pb-4">
        <p className="label-mono">Play</p>
        <h1 className="text-4xl leading-none font-semibold tracking-[-0.03em] sm:text-6xl">The arcade</h1>
        <p className="max-w-[56ch] text-lg text-muted-foreground">Same frameworks, more fun. Find your culture and conflict style, then race the clock.</p>
      </div>
      <Arcade />
    </div>
  )
}
