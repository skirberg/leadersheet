"use client"

import { useRouter } from "next/navigation"
import { FileText } from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { FRAMEWORKS, SESSIONS, sheetNo } from "@/data/course"
import { lessonHref } from "@/lib/paths"
import { NAV } from "./nav-items"
import { GAMES } from "@/data/games"

/**
 * Every word typed must start a word in the item: "trust" finds Trust and fairness, not every lesson that happens to
 * hold a t, r, u, s and t in that order, which is how the default fuzzy match read it. A match in the title (the item's
 * keywords) ranks above one deeper in its text.
 */
function byWords(value: string, search: string, keywords?: string[]) {
  const terms = search.toLowerCase().split(/\s+/).filter(Boolean)
  if (!terms.length) return 1
  const words = (t: string) => t.toLowerCase().split(/[^\p{L}\p{N}]+/u)
  const all = words(value)
  const title = words((keywords ?? []).join(" "))
  const hit = (ws: string[]) => terms.every((t) => ws.some((w) => w.startsWith(t)))
  return hit(title) ? 1 : hit(all) ? 0.5 : 0
}

/** The ⌘K search dialog. CommandMenuProvider loads it the first time someone opens search. */
export default function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const router = useRouter()

  const go = (href: string) => {
    onOpenChange(false)
    router.push(href)
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search Leadersheet"
      description="Jump to a lesson, a framework, a game or a page"
      filter={byWords}
    >
      <CommandInput placeholder="Try urgency, matrix, feedback…" />
      <CommandList className="max-h-[60vh]">
        <CommandEmpty>Nothing matches. Try one word.</CommandEmpty>
        <CommandGroup heading="Lessons">
          {SESSIONS.map((s) => (
            <CommandItem
              key={s.id}
              value={`${s.title} ${s.idea} lesson ${s.n}`}
              keywords={[s.title, `lesson ${s.n}`]}
              onSelect={() => go(lessonHref(s))}
            >
              <span className="font-mono text-xs text-muted-foreground tnum">{sheetNo(s.n)}</span>
              <span className="truncate">{s.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Frameworks">
          {FRAMEWORKS.map((f) => (
            <CommandItem
              key={f.id}
              value={`${f.name} ${f.by} ${f.one} ${f.rows.map((r) => r[0]).join(" ")}`}
              keywords={[f.name, f.by]}
              onSelect={() => go(`/frameworks/${f.id}/`)}
            >
              <span className="font-mono text-xs text-muted-foreground tnum">{sheetNo(f.s)}</span>
              <span className="truncate">{f.name}</span>
              <span className="ml-auto truncate pl-2 text-xs text-muted-foreground">{f.by}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Play">
          {GAMES.map((g) => (
            <CommandItem key={g.id} value={`game ${g.title} ${g.blurb}`} keywords={[g.title]} onSelect={() => go(`/play/${g.id}/`)}>
              <span className="font-mono text-xs text-muted-foreground">{g.kind}</span>
              <span className="truncate">{g.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Pages">
          {NAV.map((n) => (
            <CommandItem key={n.href} value={`page ${n.label}`} keywords={[n.label]} onSelect={() => go(n.href)}>
              <n.icon className="size-4" />
              {n.label}
            </CommandItem>
          ))}
          <CommandItem value="page your sheet my sheet results progress print share" keywords={["Your sheet", "my sheet"]} onSelect={() => go("/sheet/")}>
            <FileText className="size-4" />
            Your sheet
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
