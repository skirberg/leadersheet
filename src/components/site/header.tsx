"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BRAND, Wordmark } from "@/brand"
import { m } from "framer-motion"
import { cn } from "@/lib/utils"
import { isActive, navFor } from "./nav-items"
import { useProgress } from "@/lib/store"
import { ClassModeToggle } from "@/components/learn/class-only"
import { SearchButton } from "./command-menu"
import { ThemeToggle } from "./theme-toggle"
import { ModeSwitch, ModeToggle } from "@/components/play/mode-switch"

export function SiteHeader() {
  const pathname = usePathname()
  const { classMode } = useProgress()
  const NAV = navFor(classMode)
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-4 px-4 sm:px-6 lg:gap-6">
          <Link href="/" className="-ml-1 rounded-md p-1" aria-label={`${BRAND.name}, home`}>
            <Wordmark />
          </Link>
          <nav aria-label="Main" className="hidden h-full items-stretch lg:flex">
            {NAV.map((n) => {
              const on = isActive(pathname, n.href)
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  aria-current={on ? "page" : undefined}
                  className={cn(
                    "relative flex items-center px-3 text-sm text-muted-foreground transition-colors hover:text-foreground",
                    on && "font-semibold text-foreground"
                  )}
                >
                  {n.label}
                  {on && <m.span layoutId="nav-underline" className="absolute inset-x-3 -bottom-px h-[2px] bg-foreground" />}
                </Link>
              )
            })}
          </nav>
          <div className="ml-auto flex items-center gap-1.5">
            <ModeSwitch className="hidden lg:flex" />
            <ModeToggle className="lg:hidden" />
            <SearchButton />
            <ThemeToggle />
          </div>
        </div>
      </header>
      {/* Phone: thumb-reach tabs at the bottom */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <ul className={cn("grid", NAV.length === 6 ? "grid-cols-6" : "grid-cols-5")}>
          {NAV.map((n) => {
            const on = isActive(pathname, n.href)
            return (
              <li key={n.href}>
                <Link
                  href={n.href}
                  aria-current={on ? "page" : undefined}
                  className={cn(
                    "relative flex h-14 flex-col items-center justify-center gap-1 text-[10.5px] text-muted-foreground",
                    on && "font-semibold text-foreground"
                  )}
                >
                  {on && <m.span layoutId="tab-indicator" className="absolute inset-x-3 top-0 h-[2px] bg-foreground" />}
                  <n.icon className="size-[18px]" strokeWidth={on ? 2.2 : 1.8} />
                  {n.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={className} fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border pb-24 lg:pb-0">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link href="/" className="w-fit" aria-label={`${BRAND.name}, home`}>
            <Wordmark />
          </Link>
          <p className="text-xs text-muted-foreground">Summaries for learning. Read the originals.</p>
        </div>
        <nav aria-label="About this site" className="flex items-center gap-x-4 text-sm">
          <ClassModeToggle className="font-normal text-muted-foreground hover:text-foreground" />
          <Link href="/built/" className="inline-flex min-h-11 items-center text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            How it’s built
          </Link>
          <a
            href={BRAND.author.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="grid size-11 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
          >
            <GitHubIcon className="size-[18px]" />
          </a>
        </nav>
      </div>
    </footer>
  )
}
