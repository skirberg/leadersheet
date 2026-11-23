"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { dueOf, useProgress } from "@/lib/store"

/** On the home page, under today's call: how many missed questions are back today. Nothing when none are. */
export function ReviewDue() {
  const { state, ready } = useProgress()
  const n = ready ? dueOf(state.review).length : 0
  if (!n) return null
  return (
    <Link href="/practice/" className="inline-flex min-h-11 items-center gap-1.5 text-base font-medium underline-offset-4 hover:underline">
      {n} {n === 1 ? "question is" : "questions are"} back for review <ArrowRight className="size-4" />
    </Link>
  )
}
