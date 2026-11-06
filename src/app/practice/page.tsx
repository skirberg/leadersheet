import type { Metadata } from "next"
import { PracticeClient } from "./practice-client"

export const metadata: Metadata = { title: "Practice", description: "Drill questions, match frameworks to situations, and flip flashcards." }

export default function PracticePage() {
  return (
    <div className="mx-auto grid max-w-[860px] gap-8 px-4 pt-10 sm:px-6 lg:pt-14">
      <h1 className="sr-only">Make it stick</h1>
      <PracticeClient />
    </div>
  )
}
