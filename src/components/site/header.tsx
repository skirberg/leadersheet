"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BRAND, Wordmark } from "@/brand"
import { ArrowUpRight } from "lucide-react"
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
          <Link href="/" className="-ml-1 rounded-md p-1" aria-label={`${BRAND.name}, home`}>
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
  const year = 2026
  return (
    <footer className="mt-24 border-t border-border pb-24 md:pb-0">
      <div className="mx-auto grid max-w-[1240px] gap-6 px-4 py-10 sm:px-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div className="grid gap-3">
          <Link href="/" className="w-fit" aria-label={`${BRAND.name}, home`}>
            <Wordmark />
          </Link>
          <p className="max-w-[60ch] text-sm text-muted-foreground">
            An unofficial study companion for Leadership in Organizations. Summaries are for learning; read the originals.
            Your progress stays in this browser.
          </p>
        </div>
        <nav aria-label="About this site" className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <span className="text-muted-foreground">
            Built by{" "}
            <a href={BRAND.author.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground underline-offset-4 hover:underline">
              {BRAND.author.name}
            </a>
          </span>
          <a href={BRAND.author.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 font-semibold underline-offset-4 hover:underline">
            GitHub <ArrowUpRight className="size-3.5" />
          </a>
          <Link href="/built/" className="inline-flex min-h-11 items-center font-semibold underline-offset-4 hover:underline">
            How it’s built
          </Link>
          <span className="label-mono">© {year}</span>
        </nav>
      </div>
    </footer>
  )
}
