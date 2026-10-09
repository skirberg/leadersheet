"use client"

import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { FRAMEWORKS, SESSIONS, sessionById, sheetNo } from "@/data/course"
import { navFor } from "./nav-items"
import { useProgress } from "@/lib/store"
import { GAMES } from "@/data/games"

/** The ⌘K search dialog. CommandMenuProvider loads it the first time someone opens search. */
export default function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const router = useRouter()
  const { classMode } = useProgress()
  const NAV = navFor(classMode)

  const go = (href: string) => {
    onOpenChange(false)
    router.push(href)
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search the sandbox"
      description="Jump to a session, a framework or a page"
    >
      <CommandInput placeholder="Try urgency, matrix, feedback…" />
      <CommandList className="max-h-[60vh]">
        <CommandEmpty>Nothing matches. Try one word.</CommandEmpty>
        <CommandGroup heading="Sheets">
          {SESSIONS.map((s) => (
            <CommandItem
              key={s.id}
              value={`${s.title} ${s.idea} session ${s.n}`}
              onSelect={() => go(`/learn/${s.id}/`)}
            >
              <span className="font-mono text-[11px] text-muted-foreground tnum">{sheetNo(s.n)}</span>
              <span className="truncate">{s.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Frameworks">
          {FRAMEWORKS.map((f) => (
            <CommandItem
              key={f.id}
              value={`${f.name} ${f.by} ${f.one} ${f.rows.map((r) => r[0]).join(" ")}`}
              onSelect={() => go(`/learn/${sessionById(`s${f.s}`)?.id ?? "s1"}/#fw-${f.id}`)}
            >
              <span className="font-mono text-[11px] text-muted-foreground tnum">{sheetNo(f.s)}</span>
              <span className="truncate">{f.name}</span>
              <span className="ml-auto truncate pl-2 text-xs text-muted-foreground">{f.by}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Play">
          {GAMES.map((g) => (
            <CommandItem key={g.id} value={`game ${g.title} ${g.blurb}`} onSelect={() => go(`/play/${g.id}/`)}>
              <span className="font-mono text-[11px] text-muted-foreground">{g.kind.toUpperCase()}</span>
              <span className="truncate">{g.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Pages">
          {NAV.map((n) => (
            <CommandItem key={n.href} value={`page ${n.label}`} onSelect={() => go(n.href)}>
              <n.icon className="size-4" />
              {n.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
