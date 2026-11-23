import type { Metadata } from "next"
import { PracticeClient } from "./practice-client"
import { shareCard } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Practice",
  description: "Drill questions, take a final test across every lesson, match frameworks to situations, and flip flashcards.",
  ...shareCard("/og/practice.png"),
}

export default function PracticePage() {
  return (
    <div className="page">
      <h1 className="sr-only">Make it stick</h1>
      <div className="span-head grid gap-8">
        <PracticeClient />
      </div>
    </div>
  )
}
