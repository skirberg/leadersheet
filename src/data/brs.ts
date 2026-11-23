/*
  The Brief Resilience Scale (Smith, Dalen, Wiggins, Tooley, Christopher and Bernard 2008, International Journal of
  Behavioral Medicine 15(3), 194-200), word for word as the PhenX Toolkit publishes it: "This protocol is freely
  available; permission not required for use." Six statements on a five-point agreement scale; items 2, 4 and 6 are
  reverse-scored (6 minus the answer); the score is the mean, 1 to 5. The bands are PhenX's: 1.00-2.99 low,
  3.00-4.30 normal, above 4.30 high. It measures one thing, resilience in its first meaning: bouncing back from
  stress. Kept free of imports so the unit tests load it in plain Node.
*/

export const BRS_ITEMS: { q: string; rev: boolean }[] = [
  { q: "I tend to bounce back quickly after hard times", rev: false },
  { q: "I have a hard time making it through stressful events", rev: true },
  { q: "It does not take me long to recover from a stressful event", rev: false },
  { q: "It is hard for me to snap back when something bad happens", rev: true },
  { q: "I usually come through difficult times with little trouble", rev: false },
  { q: "I tend to take a long time to get over set-backs in my life", rev: true },
]

export const BRS_AGREE = ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"]

/** The normal band, from PhenX's scoring sheet. */
export const BRS_NORMAL = [3.0, 4.3] as const

/** Answers 1 to 5 in item order → the mean, with items 2, 4 and 6 reversed. Unanswered items are left out, as PhenX divides by the number answered. */
export function brsScore(answers: number[]) {
  const scored = BRS_ITEMS.flatMap((it, i) => {
    const a = answers[i]
    return a >= 1 && a <= 5 ? [it.rev ? 6 - a : a] : []
  })
  return scored.length ? scored.reduce((s, v) => s + v, 0) / scored.length : NaN
}

/** PhenX's interpretation of a score. */
export const brsBand = (score: number) => (score < BRS_NORMAL[0] ? "Low" : score <= BRS_NORMAL[1] ? "Normal" : "High")
