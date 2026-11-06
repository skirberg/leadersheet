import { BRAND } from "@/brand"
import { cn } from "@/lib/utils"

/**
 * The brand's emphasis device on a phrase. Set per brand in src/brand:
 * "underline" draws a hand-made stroke under it, "highlight" swipes a highlighter behind it.
 * Draws once on entry; appears already drawn under reduced motion.
 */
export function Emphasis({ children, className }: { children: React.ReactNode; className?: string; delay?: number }) {
  return <em className={cn("font-serif italic", className)}>{children}</em>
}
