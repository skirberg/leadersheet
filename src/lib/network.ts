/*
  Burt's network constraint for one person's network (Burt 1992, Structural Holes, chapter 2; the formula and a worked
  example in the appendix to Brokerage and Closure, 2005). For you (i) and each contact j:

    c_ij = (p_ij + Σ_q p_iq p_qj)²,   C = Σ_j c_ij,   reported ×100

  where p_ij is the share of i's ties that go to j. Ties here are simply there or not, as in Burt's own worked example
  ("here simplified to zero versus one"); his study populations weighed them by closeness. You are tied to every
  contact; a contact's ties are you plus whichever of your other contacts they know. Constraint is high when you have
  few contacts and they all know each other, and low when your contacts sit in groups that do not talk to each other:
  the structural holes you span. Burt's reference: a 27.9 mean and 10.5 standard deviation across 841 managers.
  Kept free of imports so the unit tests load it in plain Node.
*/

export const BURT_MEAN = 27.9
export const BURT_SD = 10.5

/** knows[a][b]: contacts a and b know each other (symmetric; the diagonal is ignored). */
export type Ties = boolean[][]

export const emptyTies = (n: number): Ties => Array.from({ length: n }, () => Array(n).fill(false))

const knows = (t: Ties, a: number, b: number) => a !== b && !!(t[a]?.[b] || t[b]?.[a])

/** Each contact's constraint on you (the c_ij), and their sum, both as proportions (multiply by 100 to report). */
export function constraint(ties: Ties) {
  const n = ties.length
  if (n === 0) return { total: 1, byContact: [] as number[] }
  // each contact's ties: you, plus the contacts they know
  const deg = Array.from({ length: n }, (_, q) => 1 + Array.from({ length: n }, (_, k) => (knows(ties, q, k) ? 1 : 0)).reduce((a: number, b) => a + b, 0))
  const p = 1 / n
  const byContact = Array.from({ length: n }, (_, j) => {
    let indirect = 0
    for (let q = 0; q < n; q++) if (knows(ties, q, j)) indirect += p * (1 / deg[q])
    return (p + indirect) ** 2
  })
  return { total: byContact.reduce((a, b) => a + b, 0), byContact }
}

/** The ties without contact i: their row and column go with them, so every tie stays with the two people it joins. */
export const dropContact = (ties: Ties, i: number): Ties => ties.filter((_, a) => a !== i).map((row) => row.filter((_, b) => b !== i))

/** Your contacts in groups: those who know each other, directly or through someone else here, share a group. */
export function groups(ties: Ties) {
  const n = ties.length
  const seen = Array(n).fill(false)
  const out: number[][] = []
  for (let s = 0; s < n; s++) {
    if (seen[s]) continue
    const g: number[] = []
    const stack = [s]
    seen[s] = true
    while (stack.length) {
      const a = stack.pop()!
      g.push(a)
      for (let b = 0; b < n; b++)
        if (!seen[b] && knows(ties, a, b)) {
          seen[b] = true
          stack.push(b)
        }
    }
    out.push(g.sort((a, b) => a - b))
  }
  return out
}

/** Constraint if you added one contact who knows none of the others: what one new bridge would do. */
export function withOneMore(ties: Ties) {
  const n = ties.length
  const t = Array.from({ length: n + 1 }, (_, a) => Array.from({ length: n + 1 }, (_, b) => a < n && b < n && knows(ties, a, b)))
  return constraint(t).total
}

/** How a score sits against Burt's managers: more than one standard deviation either side, or about the same. */
export function burtBand(score100: number) {
  const z = (score100 - BURT_MEAN) / BURT_SD
  return z > 1 ? "More closed" : z < -1 ? "More open" : "About average"
}
