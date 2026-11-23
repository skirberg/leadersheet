/*
  The Job Diagnostic Survey's fifteen core items (Hackman and Oldham 1974, Yale technical report No. 4, ERIC ED099580,
  "approved for public release; distribution unlimited"; Work Redesign, 1980, calls it non-copyrighted). Wording is
  the original's, so the published norms still apply. Each of the five characteristics is the mean of three items:
  one from part one (a 1 to 7 scale with three anchors) and two accuracy statements from part two, one of them
  reversed (8 minus the answer). Order within each part is the original survey's.

  Norms are Hackman and Oldham's (1980): 6,930 employees, 876 jobs, 56 organizations. Their rule for reading a job
  against them: under one standard deviation away is no real difference; two or more is quite different. They built
  the survey for groups of five or more in a job, not one person, and say their data do not support percentiles,
  so a result is a band, never a rank. Kept free of imports so the smoke test can check the scoring in plain Node.
*/

/** In the lesson 10 model's order: skill variety, task identity, task significance, autonomy, feedback. */
export const JDS_DIMS = ["Skill variety", "Task identity", "Task significance", "Autonomy", "Feedback from the job"] as const

export type JdsItem =
  | { part: 1; dim: number; q: string; anchors: [string, string, string] }
  | { part: 2; dim: number; q: string; rev: boolean }

export const JDS_ACCURACY = ["Very inaccurate", "Mostly inaccurate", "Slightly inaccurate", "Uncertain", "Slightly accurate", "Mostly accurate", "Very accurate"]

export const JDS_ITEMS: JdsItem[] = [
  {
    part: 1,
    dim: 3,
    q: "How much autonomy is there in your job? That is, to what extent does your job permit you to decide on your own how to go about doing the work?",
    anchors: [
      "Very little; the job gives me almost no personal “say” about how and when the work is done.",
      "Moderate autonomy; many things are standardized and not under my control, but I can make some decisions about the work.",
      "Very much; the job gives me almost complete responsibility for deciding how and when the work is done.",
    ],
  },
  {
    part: 1,
    dim: 1,
    q: "To what extent does your job involve doing a “whole” and identifiable piece of work? That is, is the job a complete piece of work that has an obvious beginning and end? Or is it only a small part of the overall piece of work, which is finished by other people or by automatic machines?",
    anchors: [
      "My job is only a tiny part of the overall piece of work; the results of my activities cannot be seen in the final product or service.",
      "My job is a moderate-sized “chunk” of the overall piece of work; my own contribution can be seen in the final outcome.",
      "My job involves doing the whole piece of work, from start to finish; the results of my activities are easily seen in the final product or service.",
    ],
  },
  {
    part: 1,
    dim: 0,
    q: "How much variety is there in your job? That is, to what extent does the job require you to do many different things at work, using a variety of your skills and talents?",
    anchors: [
      "Very little; the job requires me to do the same routine things over and over again.",
      "Moderate variety.",
      "Very much; the job requires me to do many different things, using a number of different skills and talents.",
    ],
  },
  {
    part: 1,
    dim: 2,
    q: "In general, how significant or important is your job? That is, are the results of your work likely to significantly affect the lives or well-being of other people?",
    anchors: [
      "Not very significant; the outcomes of my work are not likely to have important effects on other people.",
      "Moderately significant.",
      "Highly significant; the outcomes of my work can affect other people in very important ways.",
    ],
  },
  {
    part: 1,
    dim: 4,
    q: "To what extent does doing the job itself provide you with information about your work performance? That is, does the actual work itself provide clues about how well you are doing, aside from any “feedback” co-workers or supervisors may provide?",
    anchors: [
      "Very little; the job itself is set up so I could work forever without finding out how well I am doing.",
      "Moderately; sometimes doing the job provides “feedback” to me; sometimes it does not.",
      "Very much; the job is set up so that I get almost constant “feedback” as I work about how well I am doing.",
    ],
  },
  { part: 2, dim: 0, rev: false, q: "The job requires me to use a number of complex or high-level skills." },
  { part: 2, dim: 1, rev: true, q: "The job is arranged so that I do not have the chance to do an entire piece of work from beginning to end." },
  { part: 2, dim: 4, rev: false, q: "Just doing the work required by the job provides many chances for me to figure out how well I am doing." },
  { part: 2, dim: 0, rev: true, q: "The job is quite simple and repetitive." },
  { part: 2, dim: 2, rev: false, q: "This job is one where a lot of other people can be affected by how well the work gets done." },
  { part: 2, dim: 3, rev: true, q: "The job denies me any chance to use my personal initiative or judgment in carrying out the work." },
  { part: 2, dim: 1, rev: false, q: "The job provides me the chance to completely finish the pieces of work I begin." },
  { part: 2, dim: 4, rev: true, q: "The job itself provides very few clues about whether or not I am performing well." },
  { part: 2, dim: 3, rev: false, q: "The job gives me considerable opportunity for independence and freedom in how I do the work." },
  { part: 2, dim: 2, rev: true, q: "The job itself is not very significant or important in the broader scheme of things." },
]

/** Hackman and Oldham (1980) norms: means and standard deviations on 1 to 7, in JDS_DIMS order, and the typical MPS. */
export const JDS_NORMS = { mean: [4.7, 4.7, 5.5, 4.9, 4.9], sd: [1.6, 1.4, 1.3, 1.4, 1.3], mps: 128 }

export const mpsOf = (d: number[]) => ((d[0] + d[1] + d[2]) / 3) * d[3] * d[4]

/** Answers 1 to 7 in JDS_ITEMS order → the five characteristics (each a mean of three items, reversed ones as 8 minus the answer) and the MPS. */
export function jdsScore(answers: number[]) {
  const sums = [0, 0, 0, 0, 0]
  const counts = [0, 0, 0, 0, 0]
  JDS_ITEMS.forEach((it, i) => {
    const a = answers[i]
    if (!(a >= 1 && a <= 7)) return
    sums[it.dim] += it.part === 2 && it.rev ? 8 - a : a
    counts[it.dim]++
  })
  const dims = sums.map((s, k) => (counts[k] ? s / counts[k] : NaN))
  return { dims, mps: mpsOf(dims), mean: dims.reduce((a, b) => a + b, 0) / dims.length }
}

/** Where one score sits against the norm, by Hackman and Oldham's rule: under 1 SD is near, 2 or more is far. */
export function jdsBand(dim: number, v: number) {
  const z = (v - JDS_NORMS.mean[dim]) / JDS_NORMS.sd[dim]
  const where = z <= -2 ? "Well below" : z <= -1 ? "Below" : z >= 2 ? "Well above" : z >= 1 ? "Above" : "Near"
  return { z, where }
}
