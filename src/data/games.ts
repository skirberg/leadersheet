/*
  Arcade content. All items are original. The two "which one are you" quizzes map onto the
  public models from the readings (the culture map's two axes, the five conflict modes) and are
  for fun, not validated assessments. Nothing here is about the course cases.
*/

export type GameId = "culture" | "conflict" | "bias" | "climb"

export const GAMES: {
  id: GameId
  title: string
  kind: string
  blurb: string
  sheet: string
  minutes: string
}[] = [
  { id: "culture", title: "Which culture fits you?", kind: "Quiz", blurb: "Eight questions put you on the culture map.", sheet: "s4", minutes: "2 min" },
  { id: "conflict", title: "How do you fight?", kind: "Quiz", blurb: "Six everyday clashes reveal your go-to conflict style.", sheet: "s7", minutes: "2 min" },
  { id: "bias", title: "Bias blitz", kind: "60 seconds", blurb: "Spot the trap in each pitch before the clock runs out.", sheet: "s8", minutes: "1 min" },
  { id: "climb", title: "Kotter climb", kind: "Speed run", blurb: "Tap the eight steps of change in order. Beat your time.", sheet: "s5", minutes: "1 min" },
]

export const gameForSheet = (sid: string) => GAMES.find((g) => g.sheet === sid)

/* Culture quiz: every option points at one of the eight styles. */
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
      ["Raise the bar and make sure it does not happen twice", "Results"],
      ["Add a review step so it cannot happen again", "Safety"],
      ["Make sure nobody feels blamed and the team stays close", "Caring"],
    ],
  },
  {
    q: "Which compliment would you most like to hear?",
    o: [
      ["You always find a way to win", "Results"],
      ["You make this place better for everyone", "Caring"],
      ["You are the most creative person here", "Learning"],
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
