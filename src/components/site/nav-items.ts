import { BookOpen, Dumbbell, Gamepad2, LayoutGrid, Home } from "lucide-react"

export const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/learn/", label: "Learn", icon: BookOpen },
  { href: "/play/", label: "Play", icon: Gamepad2 },
  { href: "/practice/", label: "Practice", icon: Dumbbell },
  { href: "/frameworks/", label: "Frameworks", icon: LayoutGrid },
] as const

/**
 * Whether a tab is the section on screen, from the route segment that rendered (useSelectedLayoutSegment in the root
 * layout: null on the home page, "learn", "play" and so on). Not from the address bar: a missing address such as
 * /learn/nope/ renders the 404 page, whose HTML was built with no tab marked, and reading the URL there marked Learn
 * in the browser only. That disagreement was React error #418 on every 404 under /learn/, /play/ or /frameworks/.
 */
export const isActive = (segment: string | null, href: string) => (href === "/" ? segment === null : segment === href.replaceAll("/", ""))
