import type { Metadata } from "next"
import { PracticeClient } from "./practice-client"

export const metadata: Metadata = { title: "Practice", description: "Drill questions, match frameworks to situations, and flip flashcards." }

export default function PracticePage() {
  return (
    <div className="mx-auto grid max-w-[860px] gap-8 px-4 pt-10 sm:px-6 lg:pt-14">
      <div className="grid gap-2 border-b border-foreground pb-4">
        <p className="label-mono">Practice</p>
        <h1 className="text-4xl leading-none font-semibold tracking-[-0.03em] sm:text-6xl">Make it stick</h1>
        <p className="max-w-[56ch] text-lg text-muted-foreground">Three ways in: questions, matching a framework to a situation, and flashcards.</p>
      </div>
      <PracticeClient />
    </div>
  )
}
