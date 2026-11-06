import type { Metadata } from "next"
import { Arcade } from "@/components/play/arcade"

export const metadata: Metadata = { title: "Play", description: "Quizzes and games built on classic leadership frameworks." }

export default function PlayPage() {
  return (
    <div className="mx-auto grid max-w-[1240px] gap-8 px-4 pt-10 sm:px-6 lg:pt-14">
      <div className="grid justify-items-center gap-3 pb-2 text-center">
        <h1 className="text-5xl leading-[1.05] sm:text-6xl">The arcade</h1>
      </div>
      <Arcade />
    </div>
  )
}
