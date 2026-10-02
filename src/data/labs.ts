/* Lab content, ported word for word from the original study artifact. */

export type SortItem = [text: string, key: string]

export const MANAGE_ITEMS: SortItem[] = [
  ["Build next year’s budget", "M"],
  ["Explain where the team is heading and why", "L"],
  ["Hire people and assign them to roles", "M"],
  ["Get other departments behind the plan", "L"],
  ["Track results against plan and fix gaps", "M"],
  ["Help people push through a hard change", "L"],
]

export const EI_DIMS = ["Self-awareness", "Self-regulation", "Motivation", "Empathy", "Social skill"]

export type StructureKind = "functional" | "divisional" | "matrix" | "flat"
export const STRUCTURES: Record<StructureKind, { name: string; why: string; score: number[] }> = {
  functional: {
    name: "Functional",
    why: "Grouped by expertise. Deep skill, efficient, but slow when work crosses functions.",
    score: [5, 2, 2, 4],
  },
  divisional: {
    name: "Divisional",
    why: "Grouped by product, region or customer. Each unit is fast in its market, but skills and costs get duplicated.",
    score: [2, 5, 4, 4],
  },
  matrix: {
    name: "Matrix",
    why: "People report to a function and a product. Balances two priorities at the cost of clarity and speed.",
    score: [3, 4, 2, 1],
  },
  flat: {
    name: "Flat or network",
    why: "Few layers, teams form around the work. Fast and adaptive while small, unclear authority as it grows.",
    score: [2, 3, 5, 2],
  },
}
export const STRUCTURE_BARS = ["Efficiency and depth", "Market focus", "Speed and adaptability", "Clear accountability"]

export const CONGRUENCE_PAIRS: [a: string, b: string, title: string, body: string][] = [
  ["people", "formal", "Individual and formal organization", "To what extent individual needs are met by the organizational arrangements; whether people see the structure clearly; whether individual and organizational goals converge."],
  ["people", "work", "Individual and work", "To what extent the needs of individuals are met by the work, and whether they have the skills and abilities to meet its demands."],
  ["people", "informal", "Individual and informal organization", "To what extent individual needs are met by the informal organization, and whether it makes good use of people’s resources."],
  ["work", "formal", "Work and formal organization", "Whether the organizational arrangements are adequate for the demands of the work, and whether they motivate behavior consistent with it."],
  ["work", "informal", "Work and informal organization", "Whether the informal structure helps or hinders the work getting done."],
  ["formal", "informal", "Formal and informal organization", "Whether the goals, rewards and structures of the informal organization are consistent with those of the formal one."],
]

export const CULTURE_STYLES: Record<string, [x: number, y: number, desc: string]> = {
  Learning: [-0.55, 0.7, "Exploration, expansiveness, creativity"],
  Enjoyment: [-0.8, 0.3, "Fun and excitement"],
  Purpose: [0.3, 0.75, "Idealism and altruism"],
  Caring: [0.8, 0.3, "Relationships and mutual trust"],
  Results: [-0.8, -0.2, "Achievement and winning"],
  Authority: [-0.55, -0.7, "Strength, decisiveness, boldness"],
  Safety: [0.05, -0.85, "Planning, caution, preparedness"],
  Order: [0.75, -0.55, "Respect, structure, shared norms"],
}

export const CONFLICT_TYPE_ITEMS: SortItem[] = [
  ["We disagree on which market to enter first", "T"],
  ["He thinks she’s arrogant, so they avoid each other", "R"],
  ["Nobody agrees on who owns the client deck", "P"],
  ["Two analysts argue over the model’s assumptions", "T"],
  ["Meetings keep running over because no one sets an agenda", "P"],
  ["A comment in a meeting felt personal and still stings", "R"],
]

export const HOT_COOL_ITEMS: SortItem[] = [
  ["Which vendor has the lower total cost", "C"],
  ["Whether the new CEO respects the old guard", "H"],
  ["What last quarter’s churn rate actually was", "C"],
  ["Whether remote work shows commitment", "H"],
  ["Which of two launch dates the data supports", "C"],
  ["Whose team gets credit for the turnaround", "H"],
]

export const TKI_MODES: Record<string, [assert: number, coop: number, desc: string]> = {
  Competing: [0.85, 0.15, "High assertiveness, low cooperation. Right for emergencies and unpopular calls; costly to relationships if it becomes the default."],
  Collaborating: [0.85, 0.85, "High on both. Finds the answer that meets both sides’ needs. Takes time and trust."],
  Compromising: [0.5, 0.5, "Split the difference. Fast and fair-seeming, and often leaves both sides partly unhappy."],
  Avoiding: [0.15, 0.15, "Low on both. Useful when the issue is trivial or emotions need to cool; corrosive when the issue matters."],
  Accommodating: [0.15, 0.85, "Give the other side what they want. Builds goodwill; overused, your view never lands."],
}

export const RESTATE: { s: string; o: string[]; a: number }[] = [
  {
    s: "I’m frustrated that the client changed scope again and nobody pushed back.",
    o: [
      "So the scope change frustrated you, and what bothered you most is that no one on our side pushed back. Is that right?",
      "Clients always change scope. That’s the job.",
      "You should have pushed back yourself.",
    ],
    a: 0,
  },
  {
    s: "I don’t think I’m ready to lead the call next week.",
    o: [
      "You’ll be fine, you always are.",
      "You’re not sure you’re ready to lead it yet. What part feels least ready?",
      "Then I’ll ask someone else.",
    ],
    a: 1,
  },
]

export const JCM_LABELS = ["Skill variety", "Task identity", "Task significance", "Autonomy", "Feedback"]
export const EXPECTANCY_LABELS = [
  "Expectancy: if I try, I can do it",
  "Instrumentality: if I do it, I get the reward",
  "Valence: I want the reward",
]

export const LADDER_PATHS: Record<"tough" | "soft", string[]> = {
  tough: [
    "“Giving honest feedback as part of performance appraisal is really important.”",
    "The manager has reservations about the amount of directness in my feedback.",
    "The manager is giving me feedback about the importance of directness.",
    "The manager is trying to help me give better feedback by encouraging me to be more direct.",
    "I need to be tougher next time.",
  ],
  soft: [
    "“You still have to be somewhat diplomatic with people nowadays.”",
    "The manager has reservations about the amount of sensitivity in my feedback.",
    "The manager is giving me feedback about the importance of sensitivity.",
    "The manager is trying to help me give better feedback by encouraging me to be more sensitive.",
    "I need to be more sensitive next time.",
  ],
}

export const FEEDBACK_CASES: { who: string; s: string; flaws: number[]; fix: string }[] = [
  {
    who: "Bill",
    s: "We just can’t trust Bill.",
    flaws: [0, 1, 2, 3, 4],
    fix: "When it comes to new ventures, the owner sees you raising a number of reservations, but not sharing what you see as strengths or the conditions under which you could fully support a new idea. In the future he would like you to share both the assets and the liabilities of new ideas, and say when you could support one.",
  },
  {
    who: "Jane",
    s: "Jane is not a team player and is contentious.",
    flaws: [0, 1, 2, 3, 4],
    fix: "In top team meetings, Jane raised reservations about a project that had already been decided. Her boss sees those meetings as sign-off sessions and asks that she bring disagreements to him privately beforehand.",
  },
  {
    who: "Pat",
    s: "Pat does not stand firm.",
    flaws: [0, 1, 2, 4],
    fix: "Asked for examples, the Vice Chairman realized he had none. It was an untested skill, not a demonstrated weakness. He decided to test it by giving Pat a CFO role.",
  },
]

export const ENERGY_ITEMS: [dim: string, text: string][] = [
  ["Physical", "I regularly sleep less than seven or eight hours."],
  ["Physical", "I rarely take breaks during the day."],
  ["Emotional", "I often feel impatient or irritable at work."],
  ["Emotional", "I rarely tell people what I appreciate about them."],
  ["Mental", "I struggle to focus on one thing at a time."],
  ["Mental", "I spend most of my day reacting rather than on what matters most."],
  ["Spirit", "I spend too little time on what I do best and enjoy most."],
  ["Spirit", "There are gaps between what I say matters and how I spend my time."],
]
export const ENERGY_TIPS: Record<string, string> = {
  Physical: "Take a short break every 90 to 120 minutes, and protect sleep.",
  Emotional: "Look at the frustrating moment through the reverse lens: how would the other person tell it?",
  Mental: "Do the most important task first, for an hour, without email.",
  Spirit: "Spend more time on what you do best and enjoy most.",
}

/** Situations for the "Which framework?" drill. */
export const SCENARIOS: [situation: string, fwId: string][] = [
  ["A manager rewrites the budget and reporting lines but never explains why the team is changing.", "kotter-lm"],
  ["Your team never disagrees in meetings, then complains in private afterward.", "psych-safety"],
  ["A product team and a regional team keep fighting over who owns the customer.", "nine-tests"],
  ["A startup hires brilliant people, but its systems reward individual heroics over sharing.", "congruence"],
  ["A merger joins a fun, experimental firm with a cautious, rules-first one.", "culture-8"],
  ["The transformation stalls a year in, right after the CEO announced it was done.", "kotter-8"],
  ["You need a peer in another department to back your idea, and you have no authority over them.", "conger-4"],
  ["A strong team loses steam as it grows from 6 to 14 people.", "conflict-types"],
  ["A leader alternates between protecting the team and pushing it hard, and wonders which is right.", "hill-tensions"],
  ["Two partners keep fighting about whether the firm values loyalty or performance.", "hot-cool"],
  ["Your team falls in love with an acquisition target and the worst case looks oddly mild.", "k12"],
  ["You explain a plan twice, think it was clear, and the team does something else.", "transparency"],
  ["An employee keeps interrupting with rebuttals before the other person finishes.", "rogers"],
  ["A sales bonus raises revenue and destroys cross-selling between teams.", "herzberg"],
  ["An analyst does repetitive pieces of a model and never sees how it is used.", "jcm"],
  ["A manager tells someone they are unprofessional and gets an angry denial.", "five-flaws"],
  ["A leader is working 80 hour weeks and getting less done every month.", "energy-4"],
  ["A star performer has high self-ratings and colleagues describe him very differently.", "goleman-ei"],
]
