"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { BRAND } from "@/brand"

/**
 * Keeps the phone's status bar and browser chrome the color of the page. The theme-color tags follow the
 * system setting; when someone flips the theme by hand, both tags take the theme they chose.
 */
export function ThemeColor() {
  const { resolvedTheme } = useTheme()
  React.useEffect(() => {
    if (resolvedTheme !== "light" && resolvedTheme !== "dark") return
    const color = BRAND.themeColor[resolvedTheme]
    document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((m) => m.setAttribute("content", color))
  }, [resolvedTheme])
  return null
}
