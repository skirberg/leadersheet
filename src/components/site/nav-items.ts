import { BookOpen, CalendarDays, Dumbbell, LayoutGrid, Home } from "lucide-react"

export const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/learn/", label: "Learn", icon: BookOpen },
  { href: "/practice/", label: "Practice", icon: Dumbbell },
  { href: "/sheet/", label: "Sheet", icon: LayoutGrid },
  { href: "/dates/", label: "Dates", icon: CalendarDays },
] as const

export const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname.startsWith(href.replace(/\/$/, ""))
