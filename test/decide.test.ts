// How do you decide?: the test is fair to every way, scores on the continuum, and names a style only when one leads.
import { test } from "node:test"
import assert from "node:assert/strict"
import { DECIDE_QUIZ, WAYS, WAY_LESSONS, WAY_POINTS, decideResult, type Way } from "../src/data/decide.ts"
import { RESULT_GAMES, SPREAD, allResults, resultSlug } from "../src/data/results.ts"
import { FRAMEWORKS, seededOrder, sessionById } from "../src/data/course.ts"

test("ten situations, each offering every way once, on the right points of the line", () => {
  assert.equal(DECIDE_QUIZ.length, 10)
  for (const s of DECIDE_QUIZ) {
    assert.deepEqual(s.o.map((o) => o[1]).sort(), [...WAYS].sort(), s.tag)
    for (const [says, way, point] of s.o) {
      assert.ok(WAY_POINTS[way].includes(point), `${s.tag}: "${says}" is point ${point}, outside ${way}`)
      assert.ok(says.length > 8 && says.length < 90, `${s.tag}: option length`)
    }
    assert.equal(new Set(s.o.map((o) => o[0])).size, 4)
  }
})

test("the line it scores on is the site's own framework", () => {
  const f = FRAMEWORKS.find((x) => x.id === "continuum-7")!
  assert.equal(f.rows.length, 7)
  assert.deepEqual(Object.values(WAY_POINTS).flat().sort(), [1, 2, 3, 4, 5, 6, 7])
})

const pick = (ways: Way[]) => ways.map((way, i) => ({ way, point: DECIDE_QUIZ[i].o.find((o) => o[1] === way)![2] }))

test("a way leads with six of ten and more than any other; five is a spread", () => {
  assert.equal(decideResult(pick(["Tell", "Tell", "Tell", "Tell", "Tell", "Tell", "Sell", "Sell", "Join", "Join"])).lead, "Tell")
  assert.equal(decideResult(pick(["Tell", "Tell", "Tell", "Tell", "Tell", "Consult", "Consult", "Consult", "Consult", "Consult"])).lead, undefined)
  assert.equal(decideResult(pick(["Join", "Join", "Join", "Join", "Join", "Sell", "Sell", "Tell", "Tell", "Consult"])).lead, undefined)
  for (const w of WAYS) assert.equal(decideResult(pick(Array(10).fill(w))).lead, w)
})

test("random answers almost never get a style", () => {
  // 16Personalities gave a confident type to a run of answers picked at random (checked 20 Nov 2026). Here a
  // style needs six of ten, so chance alone names one about 8% of the time.
  let seed = 7
  const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648)
  let led = 0
  const runs = 20000
  for (let r = 0; r < runs; r++) if (decideResult(pick(DECIDE_QUIZ.map(() => WAYS[Math.floor(rnd() * 4)]))).lead) led++
  assert.ok(led / runs < 0.1 && led > 0, `random answers led ${((100 * led) / runs).toFixed(1)}% of the time`)
})

test("mean point sits on the line", () => {
  const r = decideResult(pick(Array(10).fill("Consult")))
  assert.ok(r.mean >= 4 && r.mean <= 5)
})

test("results: a page and a card for each way and the spread, with lessons that exist", () => {
  const g = RESULT_GAMES.decide
  assert.deepEqual(g.keys, [...WAYS, SPREAD])
  assert.deepEqual(allResults().filter((r) => r.game === "decide").map((r) => resultSlug(r.key)), ["tell", "sell", "consult", "join", "spread"])
  for (const k of g.keys) {
    assert.equal(g.lessons!(k).length, 2)
    for (const id of g.lessons!(k)) assert.ok(sessionById(id), `${k}: lesson ${id}`)
    assert.ok(g.desc(k).length > 20)
  }
  assert.ok(Object.values(WAY_LESSONS).flat().every((id) => sessionById(id)))
  assert.equal(g.label(SPREAD), "No single way")
})

test("option order is seeded, so the server and the browser draw the same quiz", () => {
  for (let i = 0; i < DECIDE_QUIZ.length; i++) {
    const a = seededOrder(4, `decide-${i}`)
    assert.deepEqual(a, seededOrder(4, `decide-${i}`))
    assert.deepEqual([...a].sort(), [0, 1, 2, 3])
  }
})
