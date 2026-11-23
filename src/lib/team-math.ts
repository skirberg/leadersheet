/*
  Team math. Every pair of people on a team is a line to keep up: n people make n(n-1)/2 of them (Brooks, The Mythical
  Man-Month, 1975, ch. 2). Split the team into pods and only the people inside a pod, plus the pod leads among
  themselves, still need a line: the same model as lesson 6's team lab and its decision case (14 people in pods of
  five: 29 lines; in pods of three: 23).

  The round asks where to split. The measure is the busiest person: a lead of the biggest pod keeps up with everyone in
  their pod and every other lead. Too few pods and the pods are big; too many and the leads drown. The lightest split
  sits near the square root of the team.
*/

/** Lines among n people who all talk to each other. */
export const pairs = (n: number) => (n * (n - 1)) / 2

/** A team of n split as evenly as it goes into p pods: sizes, largest first. */
export function podSizes(n: number, p: number) {
  const pods = Math.max(1, Math.min(p, n))
  const base = Math.floor(n / pods)
  return Array.from({ length: pods }, (_, i) => base + (i < n % pods ? 1 : 0))
}

/** Lines to keep up when n people split into p pods and only the pod leads talk across. One pod is the whole team. */
export function splitLines(n: number, p: number) {
  const sizes = podSizes(n, p)
  return sizes.reduce((a, s) => a + pairs(s), 0) + (sizes.length > 1 ? pairs(sizes.length) : 0)
}

/** How many people the busiest person keeps up with: a lead of the biggest pod (their pod, plus the other leads). */
export function busiest(n: number, p: number) {
  const sizes = podSizes(n, p)
  return sizes[0] - 1 + (sizes.length - 1)
}

/** The most pods worth offering for a team of n: past that, pods are pairs or single people. */
export const maxPods = (n: number) => Math.max(1, Math.floor(n / 2))

/** The lightest splits for a team of n: every pod count that gives the busiest person the fewest lines. */
export function lightest(n: number) {
  let best = Infinity
  let at: number[] = []
  for (let p = 1; p <= maxPods(n); p++) {
    const b = busiest(n, p)
    if (b < best) {
      best = b
      at = [p]
    } else if (b === best) at.push(p)
  }
  return { busiest: best, pods: at }
}

/** The three teams of the round: the team keeps growing, and each time you choose where to split it. */
export const ROUNDS = [9, 14, 20] as const

/** A round's verdict: right on the lightest split, one line off it, or further. */
export function verdict(n: number, p: number): "lightest" | "close" | "heavy" {
  const b = busiest(n, p) - lightest(n).busiest
  return b === 0 ? "lightest" : b === 1 ? "close" : "heavy"
}

/** What a new person adds: a line to everyone already there. */
export const added = (n: number) => n - 1

/** The share line for a finished round. */
export function teamShareText(score: number, last: { n: number; p: number } | undefined) {
  const tail = "Team math: how many lines does a team keep up?"
  if (!last) return tail
  return `I split a team of ${last.n} so nobody keeps up with more than ${busiest(last.n, last.p)} people (${score} of ${ROUNDS.length} as light as it gets). ${tail}`
}
