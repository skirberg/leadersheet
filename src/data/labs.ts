/* Lab content: the words each lesson's model shows. Sources are in docs/SOURCES.md. */

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

/* The six fits of Nadler and Tushman's congruence model (1980), each put as our own question. */
export const CONGRUENCE_PAIRS: [a: string, b: string, title: string, body: string][] = [
  ["people", "formal", "People and formal organization", "Does the structure give people what they need, and can they see how it works? Do their goals and the company’s point the same way?"],
  ["people", "work", "People and work", "Does the work give people what they want from a job? Do they have the skills it asks for?"],
  ["people", "informal", "People and informal organization", "Do the culture and the relationships around people meet their needs and put their strengths to use?"],
  ["work", "formal", "Work and formal organization", "Is the structure built for what the work demands, and do its rewards pull people toward doing the work well?"],
  ["work", "informal", "Work and informal organization", "Do the unwritten norms help the work get done, or get in its way?"],
  ["formal", "informal", "Formal and informal organization", "Do the unwritten rules reward the same things as the written ones, or pull against them?"],
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

/*
  Ladder of inference, after Argyris and as applied to feedback by Cannon and Witherspoon (2005). Our own example:
  each path climbs from the line Nora selects (rung 2) to what she decides (rung 6).
*/
export const LADDER_PATHS: Record<"tough" | "soft", string[]> = {
  tough: [
    "“The team needs firmer deadlines.”",
    "My manager thinks my deadlines are too loose.",
    "My manager is telling me to hold people to their dates.",
    "My manager thinks I let the team off too easily and wants me to be firmer.",
    "I’ll call out every missed date from now on.",
  ],
  soft: [
    "“They also need your support when something slips.”",
    "My manager thinks I come down too hard when something slips.",
    "My manager is telling me to back the team up.",
    "My manager thinks the team feels exposed and wants me to be gentler.",
    "I’ll go easier on missed dates from now on.",
  ],
}

/* Our own statements, checked against Cannon and Witherspoon's five flaws (2005). The last one has no data behind it. */
export const FEEDBACK_CASES: { who: string; s: string; flaws: number[]; fix: string }[] = [
  {
    who: "Theo",
    s: "Theo doesn’t care about customers.",
    flaws: [0, 1, 2, 3, 4],
    fix: "On three of the last five escalations, Theo closed the ticket before the customer confirmed the fix, and two came back. His lead asks him to wait for the customer’s yes before he closes one, starting this week.",
  },
  {
    who: "Maya",
    s: "Maya doesn’t take ownership.",
    flaws: [0, 1, 2, 3, 4],
    fix: "Twice this month a vendor date slipped on Maya’s project, and the team heard about it from finance first. Her manager asks her to tell the team about any slip within a day, even before she has a fix.",
  },
  {
    who: "Raj",
    s: "Raj isn’t ready to lead people.",
    flaws: [0, 1, 2, 4],
    fix: "Asked for an example, the director found none. Raj has never led a team, so this was a guess, not something anyone saw. She decided to find out by giving him a three-person project for a month.",
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
  ["A debate about which market to enter turns into who disrespected whom in the last meeting.", "conflict-types"],
  ["A leader alternates between protecting the team and pushing it hard, and wonders which is right.", "hill-tensions"],
  ["Two partners keep fighting about whether the firm values loyalty or performance.", "hot-cool"],
  ["Your team falls in love with an acquisition target and the worst case looks oddly mild.", "k12"],
  ["You explain a plan twice, think it was clear, and the team does something else.", "transparency"],
  ["An employee keeps interrupting with rebuttals before the other person finishes.", "rogers"],
  ["A company raises pay and fixes the office. Complaints stop, but nobody works any harder.", "herzberg"],
  ["An analyst does repetitive pieces of a model and never sees how it is used.", "jcm"],
  ["A manager tells someone they are unprofessional and gets an angry denial.", "five-flaws"],
  ["A leader is working 80 hour weeks and getting less done every month.", "energy-4"],
  ["A star performer has high self-ratings and colleagues describe him very differently.", "goleman-ei"],
  ["A new manager has the title, but the team keeps taking direction from a veteran everyone admires.", "power-bases"],
  ["A leader barks orders in every meeting, crisis or not, and the best people start leaving.", "goleman-6"],
  ["A manager rewards agreed results reliably but never talks about why the work matters.", "full-range"],
  ["Everyone knows the boss is skilled, but nobody believes she has their interests at heart.", "abi"],
  ["Layoffs were announced by email with no reasons given, and even survivors are angry.", "justice-4"],
  ["A sales target based only on revenue leads people to discount until the deals lose money.", "five-barriers"],
  ["Each team member says they only did their small part, so nobody feels responsible for the harm.", "disengage"],
  ["Two departments fight over one budget line, each repeating its demand louder.", "principled"],
  ["A team lead decides everything, even questions the team knows far more about.", "continuum-7"],
  ["A manager’s one on ones are all advice and no questions, and nothing changes.", "grow"],
  ["Your job search goes nowhere through close friends, who all hear about the same openings.", "ties"],
  ["A manager in New York finds her feedback crushes one colleague and barely registers with another.", "culture-map"],
  ["A project two years over budget keeps getting funding from the executive who launched it.", "escalation"],
  ["A firm keeps applying its old playbook to a market shift that needs people to change how they work.", "adaptive"],
  ["A team hires for diversity, but meetings still run on one style and the new voices go quiet.", "learning-4"],
  ["Your top values say family and health, but last week’s calendar says otherwise.", "hundred"],
  ["A manager only nods and stays silent in one on ones, and people leave with nothing new.", "trampoline"],
]

/* S13 to S24 */
export const POWER_ITEMS: SortItem[] = [
  ["They follow her plan because she can approve their bonus.", "Reward"],
  ["They comply because missing the deadline means a written warning.", "Coercive"],
  ["They accept the schedule because setting it is the manager’s job.", "Legitimate"],
  ["They take his advice on the database because he built it.", "Expert"],
  ["They volunteer for her project because they want to be like her.", "Referent"],
  ["They change their view after seeing the customer data she shares.", "Informational"],
]
export const POWER_BUCKETS = ["Reward", "Coercive", "Legitimate", "Expert", "Referent", "Informational"]

export const STYLE_ITEMS: SortItem[] = [
  ["“Stop. Shut the line down now and do exactly what I say.”", "Coercive"],
  ["“Here is where we are going and why. How you get there is up to you.”", "Authoritative"],
  ["“It has been a hard quarter. Let’s take the afternoon and reconnect.”", "Affiliative"],
  ["“Before I decide, I want to hear what each of you thinks.”", "Democratic"],
  ["“Watch how I did it and match that pace by Friday.”", "Pacesetting"],
  ["“What would you like to get better at this year? Let’s plan for it.”", "Coaching"],
]
export const STYLE_BUCKETS = ["Coercive", "Authoritative", "Affiliative", "Democratic", "Pacesetting", "Coaching"]

export const FOUR_I_ITEMS: SortItem[] = [
  ["She turned down a bonus to protect the team’s raises.", "Idealized"],
  ["He tells a story of what the clinic will mean for patients.", "Inspirational"],
  ["She asks the team to find three flaws in her own plan.", "Intellectual"],
  ["He knows each person’s goals and gives work that stretches them.", "Individualized"],
]

export const JUSTICE_ITEMS: SortItem[] = [
  ["The bonus matched what each person contributed.", "Distributive"],
  ["Everyone was rated with the same criteria and could appeal.", "Procedural"],
  ["The manager delivered the news privately and with respect.", "Interpersonal"],
  ["The manager explained the reasons honestly and in time.", "Informational"],
]

export const TRUST_TIPS: Record<string, string> = {
  Ability: "Show competence where it counts for them: deliver one visible result in their area.",
  Benevolence: "Show you care about their interests: give up something small for their benefit.",
  Integrity: "Show you keep your word: name a commitment and keep it exactly.",
}

export const DISENGAGE_ITEMS: SortItem[] = [
  ["“We are not laying people off. We are rightsizing.”", "Recast"],
  ["“Compared with what our competitors do, this is nothing.”", "Recast"],
  ["“I only followed the instructions I was given.”", "Hide"],
  ["“Everyone signed off on it, so no one person decided.”", "Hide"],
  ["“It is a tiny cost spread over millions of customers.”", "Shrink"],
  ["“Nobody was really hurt by it.”", "Shrink"],
  ["“If they had read the terms, this would not have happened.”", "Blame"],
  ["“They are just numbers in a spreadsheet.”", "Blame"],
]

export const INTEREST_ITEMS: SortItem[] = [
  ["“I need a 20% raise.”", "Position"],
  ["“I want to be paid fairly for what I now do.”", "Interest"],
  ["“We will not move the launch date.”", "Position"],
  ["“We promised the client a product before their busy season.”", "Interest"],
  ["“I want the corner office.”", "Position"],
  ["“I need a quiet place to concentrate.”", "Interest"],
]

export const GROW_ITEMS: SortItem[] = [
  ["What would you like to have achieved by the end of this talk?", "G"],
  ["What have you tried so far, and what happened?", "R"],
  ["If there were no constraints, what could you do?", "O"],
  ["What is the first step, and when will you take it?", "W"],
  ["Who is involved, and how often does this happen?", "R"],
  ["What else could you try?", "O"],
]

export const CULTURE_SCALES: [scale: string, left: string, right: string][] = [
  ["Communicating", "Low context", "High context"],
  ["Evaluating", "Direct negative feedback", "Indirect negative feedback"],
  ["Persuading", "Principles first", "Applications first"],
  ["Leading", "Egalitarian", "Hierarchical"],
  ["Deciding", "Consensual", "Top down"],
  ["Trusting", "Task based", "Relationship based"],
  ["Disagreeing", "Confrontational", "Avoids confrontation"],
  ["Scheduling", "Linear time", "Flexible time"],
]

export const ADAPTIVE_ITEMS: SortItem[] = [
  ["The server keeps crashing under load.", "Technical"],
  ["Two merged teams each think their way of working is the right one.", "Adaptive"],
  ["Payroll is paying people a day late.", "Technical"],
  ["Customers want a service model that makes the sales team’s skills obsolete.", "Adaptive"],
  ["The new office needs more meeting rooms.", "Technical"],
  ["A founder must stop approving every decision for the firm to grow.", "Adaptive"],
]

export const VOICE_ITEMS: SortItem[] = [
  ["“Thank you for raising that. What else are we not seeing?”", "Opens"],
  ["“Let’s take that offline.” (It never comes back.)", "Shuts"],
  ["The leader shares a mistake of her own first.", "Opens"],
  ["“Do you have data for that, or is it just a feeling?”", "Shuts"],
  ["Asking the quietest person first, before the senior people speak.", "Opens"],
  ["Rolling eyes when a junior person disagrees.", "Shuts"],
]

/* S09 · Which reply listened? */
export const LISTEN_REPLIES: { s: string; o: string[]; a: number; why: string }[] = [
  {
    s: "I worked all weekend on the deck and the client barely looked at it.",
    o: [
      "That happens. Clients are busy.",
      "You put in a whole weekend and it felt ignored. What did they focus on instead?",
      "Next time send it earlier so they can read it first.",
    ],
    a: 1,
    why: "It names the feeling and asks a follow-up. The others reassure or advise before understanding.",
  },
  {
    s: "I am not sure I want to lead this team anymore.",
    o: [
      "Of course you do, you are great at it.",
      "Something has changed for you. What is making you unsure?",
      "Everyone feels that way sometimes.",
    ],
    a: 1,
    why: "Praise can block someone from telling you their doubts. A question lets them keep talking.",
  },
  {
    s: "The new process is slowing everything down.",
    o: [
      "It is slowing you down. Where does it hurt most?",
      "The process was approved by leadership.",
      "Have you tried the shortcut in the menu?",
    ],
    a: 0,
    why: "Restate, then ask. Defending or fixing first ends the conversation.",
  },
]

/* S09 · Listening pairs: a timed round for two people */
export const LISTEN_STEPS: [phase: string, seconds: number, what: string][] = [
  ["Speaker", 120, "Talk about a real problem at work. The listener only restates and asks follow-up questions. No advice, no stories of their own."],
  ["Check", 30, "The listener sums up what they heard. The speaker says what they missed."],
  ["Swap", 120, "Change roles. Same rules."],
  ["Check", 30, "Sum up again, then say what it felt like to be heard."],
]

/* S24 · Last week, in hours */
export const WEEK_ROWS = ["Top goal", "Second goal", "Third goal", "Everything else"]

