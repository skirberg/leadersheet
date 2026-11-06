import type { Metadata } from "next"
import { Arcade } from "@/components/play/arcade"

export const metadata: Metadata = { title: "Play", description: "Quizzes and games built on classic leadership frameworks." }

export default function PlayPage() {
  return (
    <div className="mx-auto grid max-w-[1240px] gap-8 px-4 pt-10 sm:px-6 lg:pt-14">
      <h1 className="sr-only">The arcade</h1>
      <Arcade />
    </div>
  )
}
