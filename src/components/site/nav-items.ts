import { BookOpen, CalendarDays, Dumbbell, Gamepad2, LayoutGrid, Home } from "lucide-react"

export const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/learn/", label: "Learn", icon: BookOpen },
  { href: "/play/", label: "Play", icon: Gamepad2 },
  { href: "/practice/", label: "Practice", icon: Dumbbell },
  { href: "/sheet/", label: "Frameworks", icon: LayoutGrid },
  { href: "/dates/", label: "Dates", icon: CalendarDays, classOnly: true },
] as const

export const navFor = (classMode: boolean) => NAV.filter((n) => !("classOnly" in n) || classMode)

export const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname.startsWith(href.replace(/\/$/, ""))
