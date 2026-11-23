// The page grid (DESIGN.md, Grid) holds by construction: every page is a `page`, none sets its own width, and the
// numbers in the layout tokens add up. `npm run qa` measures the built pages; this catches the source before a build.
import { test } from "node:test"
import assert from "node:assert/strict"
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { LAYOUT } from "../src/brand/presets/leadersheet/tokens.ts"

const pages = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name)
    if (e.isDirectory()) return e.name === "og" ? [] : pages(p) // share-card sources are pictures, not pages
    return e.name === "page.tsx" || e.name === "not-found.tsx" ? [p] : []
  })

test("every page is laid on the page grid", () => {
  for (const p of pages("src/app")) {
    const s = readFileSync(p, "utf8")
    assert.match(s, /className="page[ "]/, `${p} does not use the page grid (className="page")`)
    assert.doesNotMatch(s, /mx-auto[^"]*max-w-\[|max-w-\[[^\]]+\][^"]*mx-auto/, `${p} centres a container of its own width; use the page grid`)
  }
})

test("the layout tokens add up", () => {
  const { frame, compact, medium, expanded } = LAYOUT
  // at its widest the frame divides into whole-pixel columns
  const col = (frame - (expanded.columns - 1) * expanded.gutter) / expanded.columns
  assert.ok(Number.isInteger(col), `a ${frame} px frame gives ${col} px columns at ${expanded.columns}`)
  // the window sizes go up in order and the columns double: 4, 8, then 12
  assert.ok(compact.from < medium.from && medium.from < expanded.from)
  assert.deepEqual([compact.columns, medium.columns, expanded.columns], [4, 8, 12])
  // every spacing is on the 8 px grid
  for (const g of [compact, medium, expanded]) for (const v of [g.gutter, g.margin, g.section]) assert.equal(v % 8, 0, `${v} px is off the 8 px grid`)
  assert.equal(frame % 8, 0)
})
