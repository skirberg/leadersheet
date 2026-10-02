"use client"

import * as React from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { FrameworkCard } from "@/components/learn/framework-card"
import { FRAMEWORKS, SESSIONS, sheetNo } from "@/data/course"

export function SheetClient() {
  const [q, setQ] = React.useState("")
  const term = q.trim().toLowerCase()
  const match = (id: string) => {
    if (!term) return true
    const f = FRAMEWORKS.find((x) => x.id === id)!
    return [f.name, f.by, f.one, ...f.rows.flat()].join(" ").toLowerCase().includes(term)
  }
  const groups = SESSIONS.map((s) => ({ s, fws: FRAMEWORKS.filter((f) => f.s === s.n && match(f.id)) })).filter((g) => g.fws.length)
  return (
    <div className="grid gap-10">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <label htmlFor="sh-find" className="sr-only">
          Search frameworks
        </label>
        <Input
          id="sh-find"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search, for example urgency, matrix, feedback"
          className="h-12 bg-card pl-10 text-base"
        />
      </div>
      <p role="status" className="sr-only">
        {groups.reduce((a, g) => a + g.fws.length, 0)} frameworks shown
      </p>
      {groups.length === 0 && <p className="border border-dashed border-rule p-5 text-muted-foreground">Nothing matches. Try one word.</p>}
      {groups.map(({ s, fws }) => (
        <section key={s.id} className="grid gap-4">
          <div className="flex items-baseline justify-between gap-3 border-b border-foreground pb-2.5">
            <h2 className="text-xl font-semibold tracking-[-0.01em]">
              <span className="mr-3 font-mono text-xs font-normal text-muted-foreground tnum">{sheetNo(s.n)}</span>
              {s.title}
            </h2>
            <Link href={`/learn/${s.id}/`} className="shrink-0 text-sm font-semibold underline-offset-4 hover:underline">
              Open sheet
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {fws.map((f) => (
              <FrameworkCard key={f.id} f={f} compact />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
