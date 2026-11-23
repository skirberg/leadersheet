"use client"

import * as React from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { FrameworkCard } from "@/components/learn/framework-card"
import { FRAMEWORKS, SESSIONS } from "@/data/course"
import { lessonHref } from "@/lib/paths"

export function FrameworksClient({ headings }: { headings: Record<string, string> }) {
  const [q, setQ] = React.useState("")
  const term = q.trim().toLowerCase()
  const match = (id: string) => {
    if (!term) return true
    const f = FRAMEWORKS.find((x) => x.id === id)!
    return [f.name, headings[f.id], f.by, f.one, ...f.rows.flat()].join(" ").toLowerCase().includes(term)
  }
  const groups = SESSIONS.map((s) => ({ s, fws: FRAMEWORKS.filter((f) => f.s === s.n && match(f.id)) })).filter((g) => g.fws.length)
  return (
    // On the page grid: each lesson's name in the rail, its frameworks two across from column 4 (DESIGN.md, Grid).
    <div className="span-wide grid grid-cols-subgrid gap-y-10">
      <div className="span-main relative lg:max-w-cols-8">
        <Search className="pointer-events-none absolute top-1/2 left-4.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <label htmlFor="sh-find" className="sr-only">
          Search frameworks
        </label>
        <Input
          id="sh-find"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search, for example urgency, matrix, feedback"
          className="h-12 rounded-full border-transparent bg-card pl-11 text-base"
        />
      </div>
      <p role="status" className="sr-only">
        {groups.reduce((a, g) => a + g.fws.length, 0)} frameworks shown
      </p>
      {groups.length === 0 && <p className="span-main border border-dashed border-rule p-5 text-muted-foreground lg:max-w-cols-8">Nothing matches. Try one word.</p>}
      {groups.map(({ s, fws }) => (
        <section key={s.id} className="span-wide grid grid-cols-subgrid gap-y-4">
          <div className="span-rail flex items-baseline justify-between gap-3 lg:flex-col lg:items-start lg:justify-start lg:gap-1">
            <h2 className="text-xl">{s.title}</h2>
            <Link href={lessonHref(s)} className="-my-3 shrink-0 py-3 text-sm font-semibold underline-offset-4 hover:underline">
              Open lesson
            </Link>
          </div>
          <div className="span-main grid gap-(--gutter) md:grid-cols-2 lg:max-w-cols-8">
            {fws.map((f) => (
              <FrameworkCard key={f.id} f={f} compact href={`/frameworks/${f.id}/`} name={headings[f.id]} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
