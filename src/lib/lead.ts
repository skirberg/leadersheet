/*
  One rule for every "which one are you" quiz and test. A style's chances are the questions that offer it, counted from
  the quiz itself (culture: four of eight; conflict, leadership style and power: six of six; listening: eight of eight;
  how you decide: ten of ten). A style leads only when it took more than half of its chances and more than any other
  style. Anything less is a spread, and the result says so instead of naming the style that happened to be on top.
*/

/** A quiz question: options whose second element names the style they count for (anything after it is ignored). */
export type QuizItem = { o: ReadonlyArray<readonly [string, string, ...unknown[]]> }

/** How many questions offer style k. */
export const chancesIn = (quiz: QuizItem[]) => (k: string) => quiz.filter((q) => q.o.some((o) => o[1] === k)).length

/** The leading style, or undefined for a spread. `ranked` is the styles from most picked to least. */
export function leadOf(ranked: string[], tally: Record<string, number>, chances: (k: string) => number) {
  const [first, second] = ranked
  return tally[first] > chances(first) / 2 && tally[first] > (second ? tally[second] : 0) ? first : undefined
}

/** Counts picks per style (every style starts at zero) and ranks them, most picked first; ties keep the given order. */
export function tallyOf(styles: string[], picks: string[]) {
  const tally: Record<string, number> = Object.fromEntries(styles.map((k) => [k, 0]))
  for (const p of picks) if (p in tally) tally[p] += 1
  const ranked = [...styles].sort((a, b) => tally[b] - tally[a])
  return { tally, ranked }
}
