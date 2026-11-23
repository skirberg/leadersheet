// The Brief Resilience Scale: PhenX's scoring sheet (items 2, 4 and 6 reversed, the mean of what was answered) and bands.
import { test } from "node:test"
import assert from "node:assert/strict"
import { BRS_ITEMS, brsBand, brsScore } from "../src/data/brs.ts"

test("six items, the even ones reversed", () => {
  assert.equal(BRS_ITEMS.length, 6)
  assert.deepEqual(BRS_ITEMS.map((it) => it.rev), [false, true, false, true, false, true])
})

test("the score is the mean after reversing items 2, 4 and 6", () => {
  // agreeing with everything: 5, 1, 5, 1, 5, 1 → 3
  assert.equal(brsScore([5, 5, 5, 5, 5, 5]), 3)
  // bouncing back on every item: 5 on the positive ones, 1 on the negative ones → 5
  assert.equal(brsScore([5, 1, 5, 1, 5, 1]), 5)
  assert.equal(brsScore([1, 5, 1, 5, 1, 5]), 1)
  // PhenX divides by the number answered
  assert.equal(brsScore([4, 2, 0, 0, 0, 0]), 4)
})

test("PhenX's bands: under 3 low, 3 to 4.30 normal, above high", () => {
  assert.deepEqual([2.99, 3, 4.3, 4.31].map(brsBand), ["Low", "Normal", "Normal", "High"])
})
