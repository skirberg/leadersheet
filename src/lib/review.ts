/*
  Review that comes back, kept free of imports so the smoke test can load it in plain Node. A missed question returns
  the next day; each time it is answered right on or after its day it moves to the next box and returns 3, then 7, then
  21 days later, and after that it is learned. A miss sends it back to the first box. Spaced retrieval beats asking
  again at once (Cepeda et al. 2006; Dunlosky et al. 2013 rate practice testing and spacing the two techniques of high
  utility), and a fixed widening schedule works about as well as a tuned one for a deck this size (docs/PLAN.md).
*/

/** Today in the visitor's own time zone, so a streak turns over at their midnight, not UTC's. */
export const localDay = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

export type Review = Record<string, { box: number; due: string }>

export const REVIEW_GAPS = [1, 3, 7, 21]

const addDays = (day: string, n: number) => {
  const [y, m, d] = day.split("-").map(Number)
  return localDay(new Date(y, m - 1, d + n))
}

/** The next schedule for a question after an answer: unchanged (undefined) if it was never missed, null once learned. */
export function reschedule(cur: { box: number; due: string } | undefined, ok: boolean, today = localDay()): { box: number; due: string } | null | undefined {
  if (!ok) return { box: 0, due: addDays(today, REVIEW_GAPS[0]) }
  if (!cur) return undefined
  if (cur.due > today) return cur
  const box = cur.box + 1
  return box >= REVIEW_GAPS.length ? null : { box, due: addDays(today, REVIEW_GAPS[box]) }
}

/** The questions due today or earlier, oldest first. */
export const dueOf = (review: Review, today = localDay()) =>
  Object.entries(review)
    .filter(([, r]) => r.due <= today)
    .sort((a, b) => (a[1].due < b[1].due ? -1 : a[1].due > b[1].due ? 1 : 0))
    .map(([q]) => q)
