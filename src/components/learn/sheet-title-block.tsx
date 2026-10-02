"use client"

import { TitleBlock } from "@/components/brand/title-block"
import { useProgress } from "@/lib/store"

export function SheetTitleBlock({ sheet, date, part }: { sheet: string; date: string; part: string }) {
  const { classMode } = useProgress()
  return (
    <TitleBlock
      cells={[
        { k: "Sheet", v: sheet },
        ...(classMode ? [{ k: "Class", v: date }] : []),
        { k: "Part", v: part, wide: classMode },
      ]}
    />
  )
}
