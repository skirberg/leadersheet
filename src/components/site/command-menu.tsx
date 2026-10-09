"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

// cmdk, the dialog and the full index load the first time someone opens search, not with every page.
const loadPalette = () => import("./command-palette")
const CommandPalette = dynamic(loadPalette, { ssr: false })
/** Starts the download early: on hover, focus or touch of the search button, and when ⌘ or Ctrl goes down. */
const warmPalette = () => {
  loadPalette().catch(() => {})
}

const OpenCtx = React.createContext<(v: boolean) => void>(() => {})
export const useOpenCommand = () => React.useContext(OpenCtx)

export function CommandMenuProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  // Once search has been opened the palette stays mounted, so later opens are instant.
  const [used, setUsed] = React.useState(false)

  const openMenu = React.useCallback((v: boolean) => {
    if (v) setUsed(true)
    setOpen(v)
  }, [])

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (!e.metaKey && !e.ctrlKey) return
      warmPalette()
      if (e.key === "k") {
        e.preventDefault()
        setUsed(true)
        setOpen((o) => !o)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <OpenCtx.Provider value={openMenu}>
      {children}
      {used && <CommandPalette open={open} onOpenChange={setOpen} />}
    </OpenCtx.Provider>
  )
}

export function SearchButton({ className }: { className?: string }) {
  const setOpen = useOpenCommand()
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      onPointerEnter={warmPalette}
      onFocus={warmPalette}
      onTouchStart={warmPalette}
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
