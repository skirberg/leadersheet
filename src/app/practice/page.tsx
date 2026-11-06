import type { Metadata } from "next"
import { PracticeClient } from "./practice-client"

export const metadata: Metadata = { title: "Practice", description: "Drill questions, match frameworks to situations, and flip flashcards." }

export default function PracticePage() {
  return (
    <div className="mx-auto grid max-w-[860px] gap-8 px-4 pt-10 sm:px-6 lg:pt-14">
      <div className="grid justify-items-center gap-3 pb-2 text-center">
        <h1 className="text-5xl leading-[1.05] sm:text-6xl">Make it stick</h1>
      </div>
      <PracticeClient />
    </div>
  )
}
