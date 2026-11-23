// The design pass's pictures say what the sentences said: every call lands on a named stop of its framework's rail, and
// Rewind's drawn line ends where the ending is chosen.
import { test } from "node:test"
import assert from "node:assert/strict"
import { CASES } from "../src/data/cases.ts"
import { fwById } from "../src/data/course.ts"
import { PAIRED, rowLine, rowParts } from "../src/lib/rail.ts"
import { TALKS, talkEnding, talkWalk } from "../src/data/rewind.ts"

test("every call lands on a named stop of its framework's rail", () => {
  for (const c of CASES) {
    const f = fwById(c.fw)
    assert.ok(f, `${c.sheet}: framework ${c.fw}`)
    for (const [i, o] of c.choices.entries()) {
      const { name, gloss } = rowParts(f, o.row)
      assert.ok(name.trim().length > 0, `${c.sheet} choice ${i}: no name for row ${o.row}`)
      assert.ok(name.split(/\s+/).length <= 8, `${c.sheet} choice ${i}: "${name}" is too long for a rail label`)
      // the rail keeps what the sentence said: the row's own words are all in the name and the gloss
      const r = f.rows[o.row]
      const said = `${name} ${gloss}`
      for (const part of r) if (part && !/^\d+$/.test(part)) assert.ok(said.includes(part), `${c.sheet}: "${part}" missing from the rail`)
      if (f.head && PAIRED.has(f.id) && r[1]) assert.ok(gloss.startsWith(`${f.head[1]}: `), `${c.sheet}: paired gloss names its column`)
      assert.ok(rowLine(f.id, f.head, r).length > name.length, `${c.sheet}: the screen-reader line says at least the name`)
    }
  }
})

test("a numbered point is named by what it means, with its number as the gloss", () => {
  const f = fwById("continuum-7")!
  assert.deepEqual(rowParts(f, 0), { name: f.rows[0][1], gloss: "Point 1 of 7" })
})

test("Rewind's line starts level and ends on the total that chooses the ending, for every path", () => {
  for (const t of TALKS) {
    const paths: number[][] = [[]]
    for (const turn of t.turns) paths.splice(0, paths.length, ...paths.flatMap((p) => turn.lines.map((_, j) => [...p, j])))
    for (const p of paths) {
      const walk = talkWalk(t, p)
      assert.equal(walk.length, t.turns.length + 1)
      assert.equal(walk[0], 0)
      assert.equal(walk.at(-1), talkEnding(t, p).total)
      for (let k = 1; k < walk.length; k++) assert.ok(Math.abs(walk[k] - walk[k - 1]) <= 1, "one step per line")
    }
  }
})
