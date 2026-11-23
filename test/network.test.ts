// Network constraint: checked against Burt's own worked example and reference networks (appendix to Brokerage and
// Closure, 2005, figures B1 and B2), so the map scores a network the way he does.
import { test } from "node:test"
import assert from "node:assert/strict"
import { burtBand, constraint, dropContact, emptyTies, groups, withOneMore, type Ties } from "../src/lib/network.ts"

const tie = (n: number, pairs: [number, number][]): Ties => {
  const t = emptyTies(n)
  for (const [a, b] of pairs) t[a][b] = t[b][a] = true
  return t
}
const x100 = (v: number) => Math.round(v * 1000) / 10

test("Burt's worked example: six contacts, A to F, the same score for each", () => {
  // A knows B, E and F; B knows D; C knows no one else (figure B1)
  const { total, byContact } = constraint(tie(6, [[0, 1], [0, 4], [0, 5], [1, 3]]))
  assert.deepEqual(byContact.map(x100), [15.1, 8.5, 2.8, 4.9, 4.3, 4.3])
  // Burt prints 39.9, the sum of the six rounded scores; unrounded the total is 40.03
  assert.equal(Math.round(byContact.map(x100).reduce((a, b) => a + b, 0) * 10) / 10, 39.9)
  assert.equal(Math.round(total * 10000) / 100, 40.03)
})

test("Burt's reference networks: sparse, dense and hierarchical", () => {
  const all = (n: number) => tie(n, Array.from({ length: n }, (_, a) => Array.from({ length: n }, (_, b) => [a, b] as [number, number])).flat().filter(([a, b]) => a < b))
  const star = (n: number) => tie(n, Array.from({ length: n - 1 }, (_, k) => [0, k + 1] as [number, number]))
  // figure B2: sparse 3, 5, 10 contacts score 33, 20, 10; dense 93, 65, 36; one central contact 84, 59, 41
  assert.deepEqual([3, 5, 10].map((n) => Math.round(constraint(emptyTies(n)).total * 100)), [33, 20, 10])
  assert.deepEqual([3, 5, 10].map((n) => Math.round(constraint(all(n)).total * 100)), [93, 65, 36])
  assert.deepEqual([3, 5, 10].map((n) => Math.round(constraint(star(n)).total * 100)), [84, 59, 41])
})

test("groups are contacts who know each other, directly or through someone here", () => {
  assert.deepEqual(groups(tie(6, [[0, 1], [0, 4], [0, 5], [1, 3]])), [[0, 1, 3, 4, 5], [2]])
  assert.equal(groups(emptyTies(4)).length, 4)
})

test("one more contact who knows none of the others lowers constraint", () => {
  const closed = tie(4, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]])
  assert.ok(withOneMore(closed) < constraint(closed).total)
  assert.equal(Math.round(withOneMore(emptyTies(4)) * 100), 20)
})

test("a score is read against Burt's managers (mean 27.9, standard deviation 10.5)", () => {
  assert.equal(burtBand(28), "About average")
  assert.equal(burtBand(39), "More closed")
  assert.equal(burtBand(17), "More open")
})

test("removing a contact takes their ties with them, and nobody else's", () => {
  // Ana, Ben, Cy and Dan with only Ana and Ben tied; remove Ana: Ben, Cy and Dan know no one here (33, not 61)
  const left = dropContact(tie(4, [[0, 1]]), 0)
  assert.equal(left.length, 3)
  assert.ok(left.every((row) => row.length === 3 && row.every((on) => !on)))
  assert.equal(Math.round(constraint(left).total * 100), 33)
  // remove Cy instead: Ana and Ben keep their tie
  const kept = dropContact(tie(4, [[0, 1]]), 2)
  assert.ok(kept[0][1] && kept[1][0])
})
