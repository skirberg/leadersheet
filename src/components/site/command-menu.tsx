"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
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
import { cn } from "@/lib/utils"

const OpenCtx = React.createContext<(v: boolean) => void>(() => {})
export const useOpenCommand = () => React.useContext(OpenCtx)

export function CommandMenuProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const { classMode } = useProgress()
  const NAV = navFor(classMode)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const go = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  return (
    <OpenCtx.Provider value={setOpen}>
      {children}
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
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
    </OpenCtx.Provider>
  )
}

export function SearchButton({ className }: { className?: string }) {
  const setOpen = useOpenCommand()
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-md border border-rule/50 bg-card px-3 text-sm text-muted-foreground transition-colors hover:border-foreground/60 hover:text-foreground",
        className
      )}
    >
      <Search className="size-4" />
      <span className="hidden xl:inline">Search</span>
      <kbd className="ml-2 hidden rounded-sm border border-border px-1.5 font-mono text-[10px] xl:inline">⌘K</kbd>
      <span className="sr-only xl:hidden">Search</span>
    </button>
  )
}
