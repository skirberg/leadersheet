"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Wordmark } from "@/components/brand/mark"
import { cn } from "@/lib/utils"
import { NAV, isActive } from "./nav-items"
import { SearchButton } from "./command-menu"
import { ThemeToggle } from "./theme-toggle"
import { ModeSwitch, ModeToggle } from "@/components/play/mode-switch"

export function SiteHeader() {
  const pathname = usePathname()
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-4 px-4 sm:px-6 lg:gap-6">
          <Link href="/" className="-ml-1 rounded-md p-1" aria-label="Leadership Sandbox, home">
            <Wordmark />
          </Link>
          <nav aria-label="Main" className="hidden h-full items-stretch md:flex">
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
                  {on && <span className="absolute inset-x-3 -bottom-px h-[2px] bg-foreground" />}
                </Link>
              )
            })}
          </nav>
          <div className="ml-auto flex items-center gap-1.5">
            <ModeSwitch className="hidden md:flex" />
            <ModeToggle className="md:hidden" />
            <SearchButton />
            <ThemeToggle />
          </div>
        </div>
      </header>
      {/* Phone: thumb-reach tabs at the bottom */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <ul className="grid grid-cols-6">
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
                  {on && <span className="absolute inset-x-3 top-0 h-[2px] bg-foreground" />}
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

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border pb-24 md:pb-0">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <p className="max-w-[62ch]">
          An unofficial study companion for Leadership in Organizations. Summaries are for learning; read the
          originals. Your progress stays in this browser.
        </p>
        <p className="label-mono shrink-0">Drawn to scale · 12 sheets</p>
      </div>
    </footer>
  )
}
