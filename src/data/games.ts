/*
  Arcade content. All items are original. The "which one are you" quizzes map onto the public
  models from the readings (the culture map's two axes, the five conflict modes, Goleman's six
  styles, the six bases of power, the four listening goals) and are for fun, not validated
  assessments.
*/

export type GameId = "team" | "decide" | "culture" | "conflict" | "style" | "power" | "listen" | "values" | "job" | "rewind" | "network" | "bounce" | "bias" | "climb"

export const GAMES: {
  id: GameId
  title: string
  /** What it is, in the words people search for: the arcade card's label and the link from its framework's page. */
  search: string
  kind: string
  blurb: string
  sheet: string
  minutes: string
}[] = [
  { id: "team", title: "Team math", search: "Channels formula", kind: "Drag", blurb: "Grow a team from 3 to 20 and watch the lines between people multiply. Then split one.", sheet: "s6", minutes: "3 min" },
  { id: "decide", title: "How do you decide?", search: "Decision style test", kind: "Test", blurb: "Ten calls put you on the line from deciding alone to letting the team decide.", sheet: "s19", minutes: "3 min" },
  { id: "culture", title: "Which culture fits you?", search: "Culture quiz", kind: "Quiz", blurb: "Eight questions put you on the culture map.", sheet: "s4", minutes: "2 min" },
  { id: "conflict", title: "How do you fight?", search: "Conflict style quiz", kind: "Quiz", blurb: "Six everyday clashes reveal your go-to conflict style.", sheet: "s7", minutes: "2 min" },
  { id: "style", title: "Which leadership style is yours?", search: "Leadership style quiz", kind: "Quiz", blurb: "Six situations show which of Goleman’s six styles you reach for.", sheet: "s14", minutes: "2 min" },
  { id: "power", title: "Where does your power come from?", search: "Power quiz", kind: "Quiz", blurb: "Six situations trace why people go along with you.", sheet: "s13", minutes: "2 min" },
  { id: "listen", title: "What kind of listener are you?", search: "Listening styles quiz", kind: "Quiz", blurb: "Eight moments show what you listen for.", sheet: "s9", minutes: "2 min" },
  { id: "values", title: "What do you value?", search: "Values card sort", kind: "Card sort", blurb: "Pick ten values, rank five, then check them against your week.", sheet: "s24", minutes: "3 min" },
  { id: "job", title: "Diagnose your job", search: "Job Diagnostic Survey", kind: "Survey", blurb: "Hackman and Oldham’s Job Diagnostic Survey scores your own job on the five characteristics.", sheet: "s10", minutes: "4 min" },
  { id: "rewind", title: "Rewind: the late reports", search: "Feedback practice", kind: "Conversation", blurb: "Give hard feedback one line at a time. Rewind any line and try another.", sheet: "s11", minutes: "3 min" },
  { id: "network", title: "Map your network", search: "Network map", kind: "Map", blurb: "Name the people you talk work through with, mark who knows whom, and see how closed your circle is.", sheet: "s20", minutes: "4 min" },
  { id: "bounce", title: "How fast do you bounce back?", search: "Resilience scale", kind: "Survey", blurb: "Six statements from the Brief Resilience Scale score how quickly you recover after stress.", sheet: "s22", minutes: "1 min" },
  { id: "bias", title: "Bias blitz", search: "Cognitive bias quiz", kind: "60 seconds", blurb: "Spot the trap in each pitch before the clock runs out.", sheet: "s8", minutes: "1 min" },
  { id: "climb", title: "Kotter climb", search: "Kotter’s 8 steps quiz", kind: "Speed run", blurb: "Tap the eight steps of change in order. Beat your time.", sheet: "s5", minutes: "1 min" },
]

export const gameForSheet = (sid: string) => GAMES.find((g) => g.sheet === sid)

/* Culture quiz: every option points at one of the eight styles, and every style appears in exactly four questions, so no style has more chances to win. */
export const CULTURE_QUIZ: { q: string; o: [string, string][] }[] = [
  {
    q: "Your team gets a free Friday afternoon. You would rather…",
    o: [
      ["Try a new tool nobody has used yet", "Learning"],
      ["Plan next month so nothing slips", "Safety"],
      ["Run a friendly contest to see who ships the most", "Results"],
      ["Take everyone out and check in on how they are doing", "Caring"],
    ],
  },
  {
    q: "A new boss arrives. What do you hope they do first?",
    o: [
      ["Set clear goals and make calls fast", "Authority"],
      ["Ask what we care about and why the work matters", "Purpose"],
      ["Write down how things get done here and keep it consistent", "Order"],
      ["Make work fun again", "Enjoyment"],
    ],
  },
  {
    q: "A project fails. The best response is to…",
    o: [
      ["Treat it as data and try something different next week", "Learning"],
      ["Remind everyone why the work matters and go again", "Purpose"],
      ["Add a review step so it cannot happen again", "Safety"],
      ["Make sure nobody feels blamed and the team stays close", "Caring"],
    ],
  },
  {
    q: "Which compliment would you most like to hear?",
    o: [
      ["You always find a way to win", "Results"],
      ["You make this place better for everyone", "Caring"],
      ["You make the hard calls and people follow", "Authority"],
      ["You are reliable. I never worry about your work", "Order"],
    ],
  },
  {
    q: "Pick a workspace.",
    o: [
      ["A quiet office where you make your own calls", "Authority"],
      ["One long table where everyone helps everyone", "Caring"],
      ["A lab full of whiteboards and half-built prototypes", "Learning"],
      ["A place with music, games and good snacks", "Enjoyment"],
    ],
  },
  {
    q: "The mission statement should promise to…",
    o: [
      ["Change the world, even at some cost", "Purpose"],
      ["Keep customers and people safe and secure", "Safety"],
      ["Make us number one in our market", "Results"],
      ["Respect the people and traditions that built us", "Order"],
    ],
  },
  {
    q: "A teammate breaks an unwritten rule. You…",
    o: [
      ["Remind them how we do things here", "Order"],
      ["Ask whether the rule still makes sense", "Learning"],
      ["Laugh it off if no harm was done", "Enjoyment"],
      ["Make the call yourself and move on", "Authority"],
    ],
  },
  {
    q: "A great year is one where…",
    o: [
      ["We hit every target", "Results"],
      ["We stayed true to what we believe", "Purpose"],
      ["There were no surprises and no crises", "Safety"],
      ["We had a blast doing it", "Enjoyment"],
    ],
  },
]

/* Conflict quiz: five responses per scenario, one for each mode. */
export const CONFLICT_QUIZ: { q: string; o: [string, string][] }[] = [
  {
    q: "A coworker takes credit for your idea in a meeting.",
    o: [
      ["Correct the record right there", "Competing"],
      ["Talk after, understand what happened, agree how credit works from now on", "Collaborating"],
      ["Suggest you present it as joint work", "Compromising"],
      ["Let it go. It is not worth the tension", "Avoiding"],
      ["Congratulate them. The idea getting used is what matters", "Accommodating"],
    ],
  },
  {
    q: "Two teammates want the same week off, and someone has to cover.",
    o: [
      ["Decide by who asked first and announce it", "Competing"],
      ["Get them together to find a plan that works for both", "Collaborating"],
      ["Each takes half the week", "Compromising"],
      ["Let them sort it out themselves", "Avoiding"],
      ["Cover the gap yourself", "Accommodating"],
    ],
  },
  {
    q: "Your manager sets a deadline you think is unrealistic.",
    o: [
      ["Push back hard. The date has to move", "Competing"],
      ["Walk through the plan together and redesign scope or timing", "Collaborating"],
      ["Offer most of it by the date and the rest a week later", "Compromising"],
      ["Say nothing and do your best", "Avoiding"],
      ["Agree and work the weekends", "Accommodating"],
    ],
  },
  {
    q: "In a group project, one member keeps missing meetings.",
    o: [
      ["Tell them they are off the deck if they miss another", "Competing"],
      ["Ask what is going on and rework roles so it fits", "Collaborating"],
      ["They can skip meetings but own a bigger written part", "Compromising"],
      ["Work around them quietly", "Avoiding"],
      ["Do their part so the group does not suffer", "Accommodating"],
    ],
  },
  {
    q: "You and a friend disagree about where to eat. Again.",
    o: [
      ["Your pick. You feel strongly about it", "Competing"],
      ["Find a place that gives both of you what you want", "Collaborating"],
      ["Their pick tonight, yours next time", "Compromising"],
      ["Change the subject until someone else decides", "Avoiding"],
      ["Go with theirs", "Accommodating"],
    ],
  },
  {
    q: "A client asks for a change that would hurt your team's work.",
    o: [
      ["Hold the line and explain why it will not happen", "Competing"],
      ["Dig into what they really need and design an option that serves both", "Collaborating"],
      ["Meet them halfway on scope", "Compromising"],
      ["Delay replying and hope it goes away", "Avoiding"],
      ["Give them what they ask for. Keeping them happy comes first", "Accommodating"],
    ],
  },
]

/* Bias blitz: each pitch trips one of the twelve questions from Kahneman, Lovallo and Sibony. */
export const BIAS_ITEMS: [pitch: string, bias: string][] = [
  ["The team proposing the new office is the team that gets the corner offices.", "Self-interest"],
  ["The sales head recommends the bonus plan that pays sales heads the most.", "Self-interest"],
  ["Everyone on the deal team says they just love this company.", "Affect heuristic"],
  ["The founders are so excited about the product that nobody has listed its downsides.", "Affect heuristic"],
  ["The vote was unanimous and nobody raised a single concern.", "Groupthink"],
  ["Nobody wanted to be the one to disagree with the boss.", "Groupthink"],
  ["It worked at my last company, so it will work here.", "Saliency"],
  ["This is just like the launch two years ago that went great.", "Saliency"],
  ["We only really looked at one option.", "Confirmation"],
  ["Every slide supports expanding. None of them tests the case against it.", "Confirmation"],
  ["We went with the numbers that were easiest to pull.", "Availability"],
  ["Last week's angry customer email is driving the whole plan.", "Availability"],
  ["We started from last year's budget and nudged it up a little.", "Anchoring"],
  ["The seller's first price became our starting point.", "Anchoring"],
  ["Their CEO turned around the last company, so this deal will work too.", "Halo effect"],
  ["The team is brilliant at design, so their pricing must be right too.", "Halo effect"],
  ["We have already spent two million on it. We cannot stop now.", "Sunk cost"],
  ["Too much work has gone in to change direction.", "Sunk cost"],
  ["Our base case assumes everything goes to plan.", "Overconfidence"],
  ["Revenue triples in year one, and that is the conservative scenario.", "Overconfidence"],
  ["The worst case is that we grow a little slower.", "Disaster neglect"],
  ["Nobody modeled what happens if our biggest customer leaves.", "Disaster neglect"],
  ["We passed on a strong bet because we might lose a little.", "Loss aversion"],
  ["The plan is so cautious it cannot fail, and cannot win much either.", "Loss aversion"],
]

export const BIAS_NAMES = Array.from(new Set(BIAS_ITEMS.map((b) => b[1])))

/* Leadership style quiz: six situations, each with one option per style, so every style has six chances. */
export const STYLE_QUIZ: { q: string; o: [string, string][] }[] = [
  {
    q: "Sales just fell 30% in a month. Your first move is to…",
    o: [
      ["Give clear orders and expect them followed today", "Coercive"],
      ["Explain where the team must head and let people choose how", "Authoritative"],
      ["Check in on how everyone is coping", "Affiliative"],
      ["Call the team together and ask what they see", "Democratic"],
      ["Take the hardest accounts yourself and show the pace", "Pacesetting"],
      ["Sit with the weakest seller and work on their pitch", "Coaching"],
    ],
  },
  {
    q: "A new hire is struggling. You…",
    o: [
      ["Tell them exactly what to fix by Friday", "Coercive"],
      ["Remind them how their work fits the bigger goal", "Authoritative"],
      ["Make sure they feel welcome and part of the team", "Affiliative"],
      ["Ask the team how to help them settle in", "Democratic"],
      ["Show them how you would do it, and expect the same", "Pacesetting"],
      ["Ask what they want to get better at and plan it together", "Coaching"],
    ],
  },
  {
    q: "Your team has to pick a new tool. You…",
    o: [
      ["Pick it yourself and announce it", "Coercive"],
      ["Set what the tool must achieve and let them choose", "Authoritative"],
      ["Choose the one that causes the least friction", "Affiliative"],
      ["Run a vote after everyone tries them", "Democratic"],
      ["Learn it first, fast, and expect them to keep up", "Pacesetting"],
      ["Let a junior person lead the choice and coach them through it", "Coaching"],
    ],
  },
  {
    q: "Two teammates are feuding. You…",
    o: [
      ["Tell them to stop, now", "Coercive"],
      ["Remind them what the team is here to do", "Authoritative"],
      ["Talk to each one and repair the bond", "Affiliative"],
      ["Get them together to agree a way forward", "Democratic"],
      ["Focus on the work and expect them to rise above it", "Pacesetting"],
      ["Help each see what they could do differently", "Coaching"],
    ],
  },
  {
    q: "A big deadline is a week away. You…",
    o: [
      ["Assign every task and check them daily", "Coercive"],
      ["Paint the finish line and why it matters", "Authoritative"],
      ["Keep spirits up and protect people from burnout", "Affiliative"],
      ["Ask the team how to split the work", "Democratic"],
      ["Work late yourself and set the standard", "Pacesetting"],
      ["Give someone a stretch task and back them", "Coaching"],
    ],
  },
  {
    q: "Which would you most like people to say about you?",
    o: [
      ["“In a crisis, you take control.”", "Coercive"],
      ["“You always know where we are going.”", "Authoritative"],
      ["“You look after people.”", "Affiliative"],
      ["“You listen to everyone.”", "Democratic"],
      ["“Your standards are the highest here.”", "Pacesetting"],
      ["“You made me better at my job.”", "Coaching"],
    ],
  },
]

/* Power quiz: where people's cooperation with you comes from. Six situations, one option per base. */
export const POWER_QUIZ: { q: string; o: [string, string][] }[] = [
  {
    q: "When a colleague agrees to help you, it is mostly because…",
    o: [
      ["You can do something for them in return", "Reward"],
      ["Saying no to you would cost them", "Coercive"],
      ["It is part of your role to ask", "Legitimate"],
      ["You know the subject better than anyone", "Expert"],
      ["They like you and want to work with you", "Referent"],
      ["You showed them facts that made the case", "Informational"],
    ],
  },
  {
    q: "You need a quick decision from a busy executive. You lean on…",
    o: [
      ["A favor you did them last month", "Reward"],
      ["The fact that delay will hurt their numbers", "Coercive"],
      ["Your title and the process that says it is yours to raise", "Legitimate"],
      ["Your track record on exactly this problem", "Expert"],
      ["The relationship you have built over years", "Referent"],
      ["A one-page summary of the data", "Informational"],
    ],
  },
  {
    q: "A new team member starts listening to you because…",
    o: [
      ["You control the projects they want", "Reward"],
      ["You write their review", "Coercive"],
      ["You are their manager", "Legitimate"],
      ["You clearly know the craft", "Expert"],
      ["They admire how you work", "Referent"],
      ["Your explanations make things click", "Informational"],
    ],
  },
  {
    q: "You want a change adopted across teams. Your strongest card is…",
    o: [
      ["Budget you can offer teams that adopt it", "Reward"],
      ["The audit that will flag teams that do not", "Coercive"],
      ["A mandate from the leadership team", "Legitimate"],
      ["Being the person who designed it", "Expert"],
      ["People across teams who trust you", "Referent"],
      ["Results from the pilot", "Informational"],
    ],
  },
  {
    q: "If you left tomorrow, people would miss…",
    o: [
      ["The opportunities you handed out", "Reward"],
      ["The pressure that kept things moving", "Coercive"],
      ["Someone with the authority to decide", "Legitimate"],
      ["What you knew", "Expert"],
      ["You, as a person", "Referent"],
      ["How you made sense of the facts", "Informational"],
    ],
  },
  {
    q: "In a disagreement, you usually win by…",
    o: [
      ["Offering something to sweeten it", "Reward"],
      ["Making the cost of opposing you clear", "Coercive"],
      ["Pointing out it is your call", "Legitimate"],
      ["Being right on the details", "Expert"],
      ["People wanting to stay on your side", "Referent"],
      ["Bringing evidence nobody can dismiss", "Informational"],
    ],
  },
]

/* Listening quiz: the four goals of the Listening Styles Profile-Revised (Bodie, Worthington and Gearhart, 2013), in our own items. Eight situations, one option per goal. */
export const LISTEN_QUIZ: { q: string; o: [string, string][] }[] = [
  {
    q: "A colleague starts telling you about a rough week. You mostly…",
    o: [
      ["Tune in to how they feel", "Relational"],
      ["Hear the whole story before deciding what you think", "Analytical"],
      ["Wonder how long this will take", "Task-oriented"],
      ["Notice the parts that do not add up", "Critical"],
    ],
  },
  {
    q: "In a long meeting, what frustrates you most?",
    o: [
      ["People talking over someone who is upset", "Relational"],
      ["Decisions made before every view is heard", "Analytical"],
      ["Speakers who ramble without a point", "Task-oriented"],
      ["Claims nobody checks", "Critical"],
    ],
  },
  {
    q: "A friend pitches you a business idea. You first…",
    o: [
      ["Pick up how much it means to them", "Relational"],
      ["Let them finish before you form a view", "Analytical"],
      ["Ask them to get to the numbers", "Task-oriented"],
      ["Spot the weak assumption", "Critical"],
    ],
  },
  {
    q: "What do people most often thank you for?",
    o: [
      ["Making them feel understood", "Relational"],
      ["Being fair to every side", "Analytical"],
      ["Keeping things moving", "Task-oriented"],
      ["Catching a mistake", "Critical"],
    ],
  },
  {
    q: "On a call with a customer who is complaining, you focus on…",
    o: [
      ["Calming them and keeping the relationship", "Relational"],
      ["Understanding their full account", "Analytical"],
      ["Getting to a fix quickly", "Task-oriented"],
      ["Checking their claims against the record", "Critical"],
    ],
  },
  {
    q: "When someone disagrees with you, you…",
    o: [
      ["Notice what is driving them emotionally", "Relational"],
      ["Hold your view until you have heard them out", "Analytical"],
      ["Want the short version of their point", "Task-oriented"],
      ["Look for the flaw in their argument", "Critical"],
    ],
  },
  {
    q: "You listen to a podcast mainly to…",
    o: [
      ["Feel connected to the people on it", "Relational"],
      ["Take in a complete argument", "Analytical"],
      ["Get useful tips fast", "Task-oriented"],
      ["Judge whether it holds up", "Critical"],
    ],
  },
  {
    q: "After a conversation, you best remember…",
    o: [
      ["How the other person felt", "Relational"],
      ["Each side of what was said", "Analytical"],
      ["What was decided", "Task-oriented"],
      ["What did not make sense", "Critical"],
    ],
  },
]

export const LISTEN_STYLES: Record<string, string> = {
  Relational: "You listen for feelings and connection.",
  Analytical: "You hear the whole message before you judge it.",
  "Task-oriented": "You want the point, and you notice when time is wasted.",
  Critical: "You listen for errors and things that do not add up.",
}

export const POWER_BASES: Record<string, string> = {
  Reward: "People cooperate because you can give them something they want.",
  Coercive: "People cooperate because crossing you would cost them.",
  Legitimate: "People cooperate because your role gives you the right to ask.",
  Expert: "People cooperate because they believe you know more.",
  Referent: "People cooperate because they like you and want to be like you.",
  Informational: "People cooperate because your facts and arguments persuade them.",
}

export const LEAD_STYLES: Record<string, string> = {
  Coercive: "“Do what I tell you.” Works in a crisis; hurts the climate when it is the default.",
  Authoritative: "“Come with me.” Sets a clear direction. The most positive effect on climate in Goleman’s data.",
  Affiliative: "“People come first.” Heals rifts and carries people through stressful times.",
  Democratic: "“What do you think?” Builds buy-in and draws out good ideas.",
  Pacesetting: "“Do as I do, now.” Quick results from a strong team; wears others down if overused.",
  Coaching: "“Try this.” Develops people for the long term.",
}

export const VALUES = [
  "Achievement", "Adventure", "Balance", "Community", "Courage", "Creativity", "Curiosity", "Excellence",
  "Fairness", "Faith", "Family", "Freedom", "Friendship", "Fun", "Growth", "Health",
  "Honesty", "Independence", "Influence", "Justice", "Kindness", "Learning", "Loyalty", "Purpose",
  "Recognition", "Respect", "Responsibility", "Security", "Service", "Stability", "Wealth", "Wisdom",
]

/*
  The values card sort's gap. week[v] is how much of last week went to v, from 0 (none) to 3 (a lot). A value in your
  top two is starved when it got none or a little of the week and a value you ranked below it got more. A week that
  follows your ranking (a lot, a little, none, none, none) has no gap.
*/
/*
  The values mirror: a link that carries someone's top five, in their order, and the first name they give, so the
  people they send it to can pick the five values they see in them and then compare. Nothing is stored anywhere: the
  five ride in the part of the link after #, which browsers never send to the server. One letter per value.
*/
const MIRROR_ABC = "abcdefghijklmnopqrstuvwxyz234567"

export function mirrorHash(ranked: string[], name: string) {
  const v = ranked.map((x) => MIRROR_ABC[VALUES.indexOf(x)]).join("")
  const n = name.trim().slice(0, 24)
  return `#v=${v}${n ? `&n=${encodeURIComponent(n)}` : ""}`
}

/** The five and the name a mirror link carries, or null when the link is incomplete or edited by hand. */
export function readMirror(hash: string): { five: string[]; name: string } | null {
  const p = new URLSearchParams(hash.replace(/^#/, ""))
  const five = [...(p.get("v") ?? "")].map((c) => VALUES[MIRROR_ABC.indexOf(c)]).filter((v): v is string => !!v)
  if (five.length !== 5 || new Set(five).size !== 5) return null
  return { five, name: (p.get("n") ?? "").trim().slice(0, 24) }
}

export function valuesGap(ranked: string[], week: Record<string, number>) {
  return ranked.slice(0, 2).filter((v, i) => week[v] <= 1 && ranked.slice(i + 1).some((u) => week[u] > week[v]))
}

/*
  The card sort's result, kept in this browser (the progress store) so it is still there after a reload, with the
  mirror link to send. Read back through readValues, which drops anything malformed rather than trusting storage.
*/
export type SavedValues = { picked: string[]; ranked: string[]; week: Record<string, number>; at: string }

export function readValues(x: unknown): SavedValues | null {
  if (!x || typeof x !== "object") return null
  const v = x as Partial<SavedValues>
  const known = (a: unknown): a is string[] => Array.isArray(a) && a.every((s) => typeof s === "string" && VALUES.includes(s)) && new Set(a).size === a.length
  if (!known(v.picked) || !known(v.ranked) || v.picked.length !== 10 || v.ranked.length !== 5 || !v.ranked.every((r) => v.picked!.includes(r))) return null
  const week = v.week && typeof v.week === "object" ? v.week : {}
  if (!v.ranked.every((r) => Number.isInteger(week[r]) && week[r] >= 0 && week[r] <= 3)) return null
  return { picked: v.picked, ranked: v.ranked, week: Object.fromEntries(v.ranked.map((r) => [r, week[r]])), at: typeof v.at === "string" ? v.at : "" }
}

/*
  The mirror's answer, sent back. A friend who picked five values in you sends a link to /sheet/ that carries their
  five, the five they compared with and their first name, after the # (never sent to a server). Opening it puts the
  answer on your sheet.
*/
export type MirrorAnswer = { by: string; seen: string[]; of: string[]; at: string }

const letters = (vs: string[]) => vs.map((x) => MIRROR_ABC[VALUES.indexOf(x)]).join("")
const fromLetters = (s: string) => [...s].map((c) => VALUES[MIRROR_ABC.indexOf(c)]).filter((v): v is string => !!v)
const five = (a: string[]) => a.length === 5 && new Set(a).size === 5

export function mirrorBackHash(seen: string[], of: string[], by: string) {
  const n = by.trim().slice(0, 24)
  return `#seen=${letters(seen)}&of=${letters(of)}${n ? `&by=${encodeURIComponent(n)}` : ""}`
}

/** The answer a back link carries, or null when it is incomplete or edited by hand. */
export function readMirrorBack(hash: string): Omit<MirrorAnswer, "at"> | null {
  const p = new URLSearchParams(hash.replace(/^#/, ""))
  if (!p.has("seen")) return null
  const seen = fromLetters(p.get("seen") ?? "")
  const of = fromLetters(p.get("of") ?? "")
  if (!five(seen) || !five(of)) return null
  return { seen, of, by: (p.get("by") ?? "").trim().slice(0, 24) }
}

export function readMirrorAnswers(x: unknown): MirrorAnswer[] {
  if (!Array.isArray(x)) return []
  return x.filter(
    (a): a is MirrorAnswer =>
      !!a && typeof a === "object" && typeof a.by === "string" && Array.isArray(a.seen) && Array.isArray(a.of) && five(a.seen.filter((v: unknown) => VALUES.includes(v as string))) && five(a.of.filter((v: unknown) => VALUES.includes(v as string)))
  )
}

/** Adds an answer, newest first. The same person sending the same five again replaces their earlier one; twelve at most. */
export function addMirrorAnswer(list: MirrorAnswer[], a: MirrorAnswer) {
  const same = (x: MirrorAnswer) => x.by.toLowerCase() === a.by.toLowerCase() && (a.by !== "" || x.seen.join() === a.seen.join())
  return [a, ...list.filter((x) => !same(x))].slice(0, 12)
}

/** How many of someone's five are in the five they were asked about. */
export const mirrorMatch = (a: Pick<MirrorAnswer, "seen" | "of">) => a.seen.filter((v) => a.of.includes(v)).length

/** The values people picked in you most often, most first (ties in the order of your own five, then the list). */
export function mostSeen(answers: MirrorAnswer[], mine: string[] = []) {
  const count = new Map<string, number>()
  for (const a of answers) for (const v of a.seen) count.set(v, (count.get(v) ?? 0) + 1)
  const rank = (v: string) => (mine.includes(v) ? mine.indexOf(v) : 5 + VALUES.indexOf(v))
  return [...count.entries()].sort((a, b) => b[1] - a[1] || rank(a[0]) - rank(b[0])).map(([v, n]) => ({ value: v, n }))
}

export { MIRROR_ABC }
