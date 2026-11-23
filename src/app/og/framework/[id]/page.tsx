import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { FrameworkShareCard } from "@/components/og/framework-card"
import { FRAMEWORKS, SESSIONS, fwById } from "@/data/course"

// Source for public/og/framework-<id>.png (scripts/make-og.ts). Not linked anywhere and not indexed.
export const metadata: Metadata = { title: "Framework card", robots: { index: false, follow: false } }
export const dynamicParams = false
export function generateStaticParams() {
  return FRAMEWORKS.map((f) => ({ id: f.id }))
}

export default async function FrameworkCard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const f = fwById(id)
  const s = f && SESSIONS.find((x) => x.n === f.s)
  if (!f || !s) notFound()
  return <FrameworkShareCard f={f} s={s} />
}
