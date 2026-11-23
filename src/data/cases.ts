/*
  One decision per lesson: you are the one who has to choose, today. Each choice maps to a row of the
  lesson's framework, and where the lesson's model keeps state, the choice moves that model too (`set`
  writes the same keys the lab reads). Every number a result quotes is what the model shows after `set`.
  Claims come from the lesson's own readings; docs/SOURCES.md lists them.
*/

export type Grade = "strong" | "tradeoff" | "costly"

export type CaseChoice = {
  /** What you do, in your own words. */
  says: string
  grade: Grade
  /** What happens, and what the lesson's readings say about it. */
  then: string
  /** The row of the case's framework this choice puts to work. */
  row: number
  /** Lab state this choice writes, so the model above shows it. */
  set?: Record<string, unknown>
  /** Lab state written only when the visitor has none yet (never overwrites their own answer). */
  seed?: Record<string, unknown>
}

export type Case = {
  sheet: string
  /** Who you are in the case. */
  role: string
  setup: string
  ask: string
  /** The framework whose rows the choices land on. */
  fw: string
  /** What the model above shows after a choice, for lessons whose model moves. */
  moves?: string
  choices: CaseChoice[]
}

export const GRADE_LABEL: Record<Grade, string> = {
  strong: "Strong call",
  tradeoff: "Trade-off",
  costly: "Costly",
}

const CULTURE_SCALE_COUNT = 8
const scales = (k: number, you: number, them: number) => Array.from({ length: CULTURE_SCALE_COUNT }, (_, i) => (i === k ? [you, them] : [3, 7]))

export const CASES: Case[] = [
  {
    sheet: "s1",
    role: "You run a 40-person customer support group.",
    setup:
      "Tickets keep getting dropped at the handoff between the day and night shifts. You have told people twice, at all-hands meetings, to write better notes. Last week a large customer waited three days for a reply.",
    ask: "What do you do this week?",
    fw: "kotter-lm",
    choices: [
      {
        says: "Give a third, sharper talk about ownership.",
        grade: "costly",
        then: "You are shaping behavior directly, for the third time. Bernstein, Raffaelli and Margolis: leaders also shape it indirectly, through what they build around people. A talk changes a mood; the handoff stays the same.",
        row: 2,
      },
      {
        says: "Redesign the handoff: a required notes field, ten minutes of shift overlap, and one named owner for every open ticket.",
        grade: "strong",
        then: "The architect’s move: change what surrounds people so the right behavior is the easy one. In Kotter’s terms it is management doing its job, organizing and staffing to cope with complexity.",
        row: 1,
      },
      {
        says: "Count dropped tickets by person and post the numbers every week.",
        grade: "tradeoff",
        then: "Controls catch the misses, which is management’s job too. On their own they tell people they are watched, not why the handoff keeps failing.",
        row: 2,
      },
    ],
  },
  {
    sheet: "s2",
    role: "You lead a product team of eight.",
    setup:
      "In a review with your director watching, a junior engineer says your launch plan has a security gap. She is right, and you feel your face go hot.",
    ask: "What do you say?",
    fw: "psych-safety",
    moves: "The dashed line in the radar above shows how the room would rate you after this meeting.",
    choices: [
      {
        says: "“We’ve been over this. Let’s take it offline.”",
        grade: "costly",
        then: "The gap still gets fixed, but everyone in the room learned that naming a problem costs something. Edmondson calls high standards without safety the anxiety zone; it is where people stop speaking up.",
        row: 2,
        set: { ei2: [3, 2, 3, 2, 3] },
      },
      {
        says: "“Good catch. Walk us through it.” Then fix the plan with her.",
        grade: "strong",
        then: "You kept the standard and made it safe to raise a problem in front of a boss. Goleman would call the first second self-regulation: the heat is real, you just do not act on it.",
        row: 3,
        set: { ei2: [3, 4, 3, 4, 4] },
      },
      {
        says: "“Thanks, noted,” and move to the next slide.",
        grade: "tradeoff",
        then: "Polite, and the gap is not dealt with in the room. People feel safe enough, and learn that raising issues changes nothing: Edmondson’s comfort zone.",
        row: 1,
        set: { ei2: [3, 3, 3, 3, 3] },
      },
    ],
  },
  {
    sheet: "s3",
    role: "You are chief operating officer of a 400-person hardware company organized by function: sales, product and finance.",
    setup:
      "You are launching a subscription service with different customers, a faster pace and its own pricing. Six months in, every function still puts the service behind the hardware work.",
    ask: "How do you organize?",
    fw: "structures",
    moves: "The org chart and the bars in the first model above switch to the structure you chose.",
    choices: [
      {
        says: "Keep the functions and name a coordinator for the service.",
        grade: "costly",
        then: "Deep skills stay, but the service still waits in every function’s queue. It fails Goold and Campbell’s specialist cultures test: a unit that needs a different culture is not protected from the rest.",
        row: 0,
        set: { st: "functional" },
      },
      {
        says: "Make the service its own division, with its own sales and product people.",
        grade: "strong",
        then: "Market focus and speed rise, and the service can build a culture of its own. The cost is duplicated skills and spending, so check that the service is big enough to carry them.",
        row: 1,
        set: { st: "divisional" },
      },
      {
        says: "Set up a matrix: service leads who borrow people from each function.",
        grade: "tradeoff",
        then: "It balances both priorities on paper. In practice people answer to two bosses, and clear accountability is the lowest bar on the chart.",
        row: 2,
        set: { st: "matrix" },
      },
      {
        says: "Go flat: no departments, teams form around the work.",
        grade: "costly",
        then: "Fast and adaptive while small. At 400 people the likely result is unclear authority, and the hardware business loses its depth.",
        row: 3,
        set: { st: "flat" },
      },
    ],
  },
  {
    sheet: "s4",
    role: "You have just taken over a hospital pharmacy team known for zero dispensing errors.",
    setup: "The board wants the team to pilot three new patient services this year. The team is careful, proud of its record and slow to change.",
    ask: "Which culture do you aim for?",
    fw: "culture-8",
    moves: "The culture map above marks the two styles and the distance between them.",
    choices: [
      {
        says: "Keep Safety, and add Learning on the pilots only.",
        grade: "strong",
        then: "Groysberg and colleagues: shape culture toward the strategy, and build on what already works. Learning and Safety sit far apart on the map, so expect tension; keeping the pilots separate gives each one room.",
        row: 2,
        set: { cu: ["Safety", "Learning"] },
      },
      {
        says: "Push Results: targets for each pilot and a weekly leaderboard.",
        grade: "tradeoff",
        then: "Results brings speed, and fits what the board asked for. In a pharmacy, a leaderboard can reward the wrong kind of risk.",
        row: 4,
        set: { cu: ["Safety", "Results"] },
      },
      {
        says: "Leave the culture alone and run the pilots through the usual process.",
        grade: "costly",
        then: "Safety and Order sit close together and reinforce each other, which is exactly why nothing new gets tried. The strategy changed; the culture did not.",
        row: 6,
        set: { cu: ["Safety", "Order"] },
      },
    ],
  },
  {
    sheet: "s5",
    role: "You are the vice president moving 200 salespeople to a new CRM.",
    setup:
      "The executive team has signed off, the vendor is ready, and a launch email is drafted for Monday. Most of the sales floor has not heard why the old system has to go.",
    ask: "What do you do before Monday?",
    fw: "kotter-8",
    moves: "The staircase above lights the step your choice turns on.",
    choices: [
      {
        says: "Send the email. The decision is made.",
        grade: "costly",
        then: "Kotter’s first error: not enough urgency. People who do not see why the old way has to end will wait the new one out.",
        row: 0,
        set: { kt: 0 },
      },
      {
        says: "Show the floor the deals lost to the old system, then ask three respected sales leads to shape the rollout.",
        grade: "strong",
        then: "Urgency first, then a guiding coalition with credibility on the floor. Conger would add that those leads bring the credibility and common ground a launch email cannot.",
        row: 1,
        set: { kt: 1 },
      },
      {
        says: "Run a pilot with one region and publicize its first win.",
        grade: "tradeoff",
        then: "Short-term wins matter, but this is step six with steps one and two skipped: a win nobody was waiting for.",
        row: 5,
        set: { kt: 5 },
      },
    ],
  },
  {
    sheet: "s6",
    role: "Your team of six works. Next quarter it becomes fourteen.",
    setup: "Today everyone joins every decision, and that is part of why it works. With fourteen people, the weekly meeting would run two hours.",
    ask: "How do you set up the bigger team?",
    fw: "hill-tensions",
    moves: "The team in the first model above grows to fourteen and splits the way you chose.",
    choices: [
      {
        says: "Keep one team of fourteen. Everyone stays in every decision.",
        grade: "costly",
        then: "Unity is kept, at the price of 91 conversations to keep up instead of 15. Hackman’s rule of thumb for team size: no double digits.",
        row: 0,
        set: { tn: 14, "tw-pod": 15 },
        seed: { "tw-take": "?" },
      },
      {
        says: "Split into pods of five, each with a lead. The leads meet weekly.",
        grade: "strong",
        then: "29 conversations instead of 91. Hill’s tension moves rather than vanishes: pods get discretion, and you keep authority over what crosses them, through the leads.",
        row: 3,
        set: { tn: 14, "tw-pod": 5 },
        seed: { "tw-take": "?" },
      },
      {
        says: "Split into pods of three.",
        grade: "tradeoff",
        then: "Only 23 conversations, but five leads now carry everything that crosses pods, and a pod of three has little room for different views.",
        row: 0,
        set: { tn: 14, "tw-pod": 3 },
        seed: { "tw-take": "?" },
      },
    ],
  },
  {
    sheet: "s7",
    role: "You manage two senior engineers who have argued for a week about rewriting the billing service.",
    setup:
      "Yesterday one called the other’s plan “reckless” in the team channel. Both have sent you long documents full of data, and neither document has changed the other’s mind.",
    ask: "What is your move?",
    fw: "tki",
    moves: "The conflict-modes chart above marks the mode you chose.",
    choices: [
      {
        says: "Read both documents and make the call yourself.",
        grade: "tradeoff",
        then: "A decision ends the argument, not the conflict. Edmondson and Smith: when a conflict runs hot, more data rarely settles it, because it is about what each person stands for.",
        row: 0,
        set: { tki: "Competing" },
      },
      {
        says: "Meet each one alone and ask what the rewrite means to them. Then agree together on a test both accept.",
        grade: "strong",
        then: "This is the move for a hot conflict: slow down, ask about the story each person tells, then share reasoning both ways. It takes longer, and it ends the conflict, not just the meeting.",
        row: 1,
        set: { tki: "Collaborating" },
      },
      {
        says: "Split it: rewrite half the service now and half next year.",
        grade: "costly",
        then: "Quick and fair-looking. Both lose part of what matters to them, and a technical question is now answered by politics.",
        row: 2,
        set: { tki: "Compromising" },
      },
      {
        says: "Let it cool, and revisit it next quarter.",
        grade: "costly",
        then: "Useful for a day while tempers settle. For a quarter, a hot conflict goes underground and grows.",
        row: 3,
        set: { tki: "Avoiding" },
      },
    ],
  },
  {
    sheet: "s8",
    role: "You are the chief executive. Your strategy team recommends buying a startup for $40 million.",
    setup:
      "The deal lead built the model and clearly admires the founders. The main comparison is your last acquisition, which went well. No one on the team argued against the deal.",
    ask: "What do you ask for before you decide?",
    fw: "k12",
    moves: "The twelve questions above show the flags your choice raises.",
    choices: [
      {
        says: "Nothing more. The team knows the market; approve it.",
        grade: "costly",
        then: "Kahneman, Lovallo and Sibony: you cannot see your own biases, but you can see the team’s. Three were in plain sight here: affection for the deal, a single analogy and no dissent.",
        row: 1,
        set: { k12: {}, k12n: "Buy the startup for $40 million" },
      },
      {
        says: "Ask how this deal differs from the last one, and what the worst case looks like.",
        grade: "tradeoff",
        then: "Two good questions, on saliency and disaster neglect. The team’s attachment to the founders and the missing dissent are still unchecked.",
        row: 3,
        set: { k12: { 3: true, 10: true }, k12n: "Buy the startup for $40 million" },
      },
      {
        says: "Ask for an outside check on the numbers, a real worst case, and one person assigned to argue against the deal.",
        grade: "strong",
        then: "Six flags raised and answered before you commit. The twelve questions exist for this: the people proposing a deal are the worst placed to see its biases.",
        row: 2,
        set: { k12: { 1: true, 2: true, 3: true, 6: true, 9: true, 10: true }, k12n: "Buy the startup for $40 million" },
      },
    ],
  },
  {
    sheet: "s9",
    role: "You lead a design team.",
    setup: "At the end of a one-on-one, Priya says: “I don’t think I can hit the deadline. Everything keeps changing.”",
    ask: "What do you say first?",
    fw: "rogers",
    choices: [
      {
        says: "“You’ll be fine. You always pull it off.”",
        grade: "costly",
        then: "Kind, and still a judgment from your own frame: it tells her the feeling is wrong. Rogers: the urge to evaluate is the main barrier to communication.",
        row: 0,
      },
      {
        says: "“Let’s drop the weekly report so you have more time.”",
        grade: "tradeoff",
        then: "Maybe a useful fix, but offered before you know what is wrong. You solved your version of the problem.",
        row: 0,
      },
      {
        says: "“Things keep moving, and the deadline feels out of reach. Is that it?”",
        grade: "strong",
        then: "Saying it back until she agrees you got it is Rogers’s rule. Itzchakov and Kluger found that being listened to this way lowers anxiety and defensiveness, so her next sentence is more likely to be the real problem.",
        row: 2,
      },
    ],
  },
  {
    sheet: "s10",
    role: "You run a 20-person customer support team.",
    setup:
      "Satisfaction scores are slipping, and finance offers $2,000 bonuses for hitting ticket-count targets. Today tickets go to whoever is free, and agents never hear how a customer’s problem ended.",
    ask: "What do you change first?",
    fw: "herzberg",
    moves: "The motivating potential score and the expectancy sliders above show the job after your change.",
    choices: [
      {
        says: "Take the bonus for ticket counts.",
        grade: "tradeoff",
        then: "Pay matters, so the expectancy total above rises to 0.50. The job itself is unchanged at 64. Pfeffer and Sutton: incentives get you exactly what you pay for, gaming included, and here that is short tickets closed fast.",
        row: 0,
        set: { jcm: [4, 4, 4, 4, 4], ex: [0.8, 0.9, 0.7] },
      },
      {
        says: "Give each agent a set of customers to own end to end, and show them their satisfaction scores every week.",
        grade: "strong",
        then: "Task identity, autonomy and feedback all rise, and the score goes from 64 to 180. Herzberg: the work itself is a motivator; pay mostly removes dissatisfaction.",
        row: 1,
        set: { jcm: [4, 6, 5, 6, 6], ex: [0.8, 0.6, 0.7] },
      },
      {
        says: "Only share the weekly satisfaction scores.",
        grade: "tradeoff",
        then: "Feedback alone takes the score from 64 to 96, because it multiplies everything else. Cheap, and a good first step, but the work itself has not changed.",
        row: 1,
        set: { jcm: [4, 4, 4, 4, 6], ex: [0.8, 0.6, 0.7] },
      },
    ],
  },
  {
    sheet: "s11",
    role: "You manage Sam, who has missed two deadlines this month.",
    setup: "You are about to talk to him. The sentence in your head is “You’re not committed to this team.”",
    ask: "What do you open with?",
    fw: "ladder",
    choices: [
      {
        says: "“You’re not committed to this team.”",
        grade: "costly",
        then: "A conclusion from near the top of the ladder. Cannon and Witherspoon would flag it twice: it attacks the person and gives no example, so all Sam can do is defend himself.",
        row: 1,
      },
      {
        says: "“You’ve seemed a bit off lately. Everything OK?”",
        grade: "tradeoff",
        then: "Kinder, and still vague: Sam cannot tell which behavior you mean or what you want changed.",
        row: 2,
      },
      {
        says: "“The Q3 report came in Friday, two days after the date we agreed, and the client asked about it twice. What happened?”",
        grade: "strong",
        then: "You started at the bottom of the ladder: what you saw, its impact, then a question. Now there is something specific to fix, and room for a reason you did not know.",
        row: 4,
      },
    ],
  },
  {
    sheet: "s13",
    role: "You have just been made project lead over four peers who were your teammates last month.",
    setup: "Nobody reports to you on the org chart. The project is late, and one peer keeps skipping the Thursday check-in.",
    ask: "How do you get him to show up?",
    fw: "power-bases",
    choices: [
      {
        says: "Remind him that the vice president put you in charge.",
        grade: "tradeoff",
        then: "Legitimate power is real, and thin with peers. It gets attendance, not effort.",
        row: 2,
      },
      {
        says: "Tell him you will mention it in his performance review.",
        grade: "costly",
        then: "You may not even hold this power, and threatening it spends the goodwill you will need for the rest of the project. Coercion gets compliance at best.",
        row: 1,
      },
      {
        says: "Show him what the delays are costing, ask what the meeting costs him, and cut the part that wastes his time.",
        grade: "strong",
        then: "Informational power, which Raven added later: the argument itself persuades, and it does not depend on your title. Fixing the meeting makes showing up worth it.",
        row: 5,
      },
    ],
  },
  {
    sheet: "s14",
    role: "You have just taken over a sales team that missed its target three quarters running.",
    setup: "Morale is low, two top performers are interviewing elsewhere, and nobody agrees any more on what the team is for.",
    ask: "Which style do you lead with in your first month?",
    fw: "goleman-6",
    choices: [
      {
        says: "Pacesetting: show them how you would close, and expect the same now.",
        grade: "costly",
        then: "Pacesetting had a negative effect on climate overall in Goleman’s data, and it works only with a strong, motivated team. A demoralized team hears “you are not good enough.”",
        row: 4,
      },
      {
        says: "Authoritative: set a clear direction, and let people choose how to get there.",
        grade: "strong",
        then: "In Goleman’s data this style had the most strongly positive effect on climate, and it fits when a new direction is needed. Add affiliative moves for the two who are leaving.",
        row: 1,
      },
      {
        says: "Coercive: new rules, daily call quotas, no exceptions.",
        grade: "tradeoff",
        then: "It fits a true crisis, for a short time. As the main style it drives out the people you can least afford to lose.",
        row: 0,
      },
      {
        says: "Democratic: ask the team what to do.",
        grade: "tradeoff",
        then: "It builds buy-in, but a team that has lost its way and is asked for direction gets more meetings. It works better once the direction is set.",
        row: 3,
      },
    ],
  },
  {
    sheet: "s15",
    role: "You lead a 12-person analytics team that hits its numbers and nothing more.",
    setup: "Your boss wants the team to start proposing projects, not just answering requests. You have a small bonus pool and a lot of freedom.",
    ask: "What do you lead with?",
    fw: "full-range",
    choices: [
      {
        says: "Tie the bonus pool to the number of proposals submitted.",
        grade: "tradeoff",
        then: "Contingent reward works: .39 in Judge and Piccolo’s meta-analysis. You will get proposals. Whether they are good ones depends on more than the bonus.",
        row: 1,
      },
      {
        says: "Explain why proposals matter, question the team’s assumptions in reviews, and coach each person on one idea.",
        grade: "strong",
        then: "That is three of Bass and Avolio’s four parts of transformational leadership, the style with the highest overall validity in the same study, .44. Keep the bonus too; the two work together.",
        row: 0,
      },
      {
        says: "Leave it to them. They are senior.",
        grade: "costly",
        then: "Judge and Piccolo found laissez-faire leadership related to worse outcomes, minus .37. Freedom without direction usually brings more of the same.",
        row: 3,
      },
    ],
  },
  {
    sheet: "s16",
    role: "You have to cut your 30-person team’s travel budget in half.",
    setup: "Some trips have to go. Three people have conferences they have planned for months, and one of them is presenting.",
    ask: "How do you decide, and how do you tell people?",
    fw: "justice-4",
    moves: "The trust sliders above show how your team might rate you afterwards.",
    choices: [
      {
        says: "Decide yourself and announce the cuts in an email, without reasons.",
        grade: "costly",
        then: "People may accept the outcome and still judge you harshly for how they heard it. Colquitt’s informational fairness asks for truthful reasons, given in time.",
        row: 3,
        set: { abi: [5, 3, 4] },
      },
      {
        says: "Publish the rule first (presenters and client trips keep funding), let people make their case, then decide.",
        grade: "strong",
        then: "People judge fairness by the process and the treatment, not only the outcome. Some still lose a trip; fewer lose trust in you.",
        row: 1,
        set: { abi: [5, 6, 6] },
      },
      {
        says: "Cut every trip by the same amount, so no one is singled out.",
        grade: "tradeoff",
        then: "Equal looks fair, but the person presenting loses as much as someone attending casually. Distributive fairness means outcomes that fit what people put in, not identical cuts.",
        row: 0,
        set: { abi: [5, 5, 4] },
      },
    ],
  },
  {
    sheet: "s17",
    role: "You run a sales region with an aggressive new target.",
    setup: "Numbers jumped after a new incentive. A rep mentions, in passing, that some colleagues now book next quarter’s deals early, “like everyone does.”",
    ask: "What do you do?",
    fw: "five-barriers",
    choices: [
      {
        says: "Celebrate the quarter. The numbers are real.",
        grade: "costly",
        then: "Bazerman and Tenbrunsel: check that good results came from good methods. Overvaluing outcomes is how a shortcut becomes standard practice.",
        row: 4,
      },
      {
        says: "Look into the early bookings now, while they are small.",
        grade: "strong",
        then: "Investigate small infractions early. Each step looked small to the people taking it; that is the slippery slope.",
        row: 3,
      },
      {
        says: "Remind everyone of the code of conduct at the next meeting.",
        grade: "tradeoff",
        then: "A reminder does not touch the cause. The target itself may be the problem: ask what it pushes people to do, and change that.",
        row: 0,
      },
    ],
  },
  {
    sheet: "s18",
    role: "You are hiring a design studio for a three-month project.",
    setup: "Your budget stretches to $60k. The studio opens at $75k. You have learned that another good studio would do the work for $55k.",
    ask: "What do you do?",
    fw: "zone",
    moves: "The bargaining zone above redraws with the walk-away points your choice sets.",
    choices: [
      {
        says: "Split the difference and offer $67k.",
        grade: "costly",
        then: "Their first offer anchored you, and you moved past your own walk-away to meet it. Galinsky and Mussweiler: counter an anchor by focusing on alternatives.",
        row: 3,
        set: { zopa: [40, 67, 75] },
      },
      {
        says: "Name your alternative, the $55k studio, and ask what they could do to match it.",
        grade: "strong",
        then: "Your best alternative now sets your walk-away at $55k. A zone still exists, from $40k to $55k, and you negotiate inside it, not from their anchor.",
        row: 0,
        set: { zopa: [40, 55, 75] },
      },
      {
        says: "Ask what they need from the project: timing, a case study, the right to show the work.",
        grade: "strong",
        then: "Interests, not positions. A case study and flexible timing are worth money to them, so their walk-away drops and the zone widens to $35k to $60k.",
        row: 1,
        set: { zopa: [35, 60, 75] },
      },
    ],
  },
  {
    sheet: "s19",
    role: "Your team has to choose a new on-call schedule. They will live with it; you will answer for outages.",
    setup: "Two engineers hold strong, opposite views. You have an opinion too, but they know the work better than you do.",
    ask: "Where on the line do you put the decision?",
    fw: "continuum-7",
    moves: "The continuum slider above moves to the point you chose.",
    choices: [
      {
        says: "Decide and announce it.",
        grade: "costly",
        then: "Fast, and it is the call you will defend. Tannenbaum and Schmidt: the right point depends on the team, and for people who know the work and live with the result, telling wastes what they know.",
        row: 0,
        set: { cont: 1 },
      },
      {
        says: "Ask for ideas, then decide yourself.",
        grade: "tradeoff",
        then: "A sound middle point. Say up front that you will decide, or the engineer whose idea loses will feel consulted for show.",
        row: 4,
        set: { cont: 5 },
      },
      {
        says: "Set the limits (full coverage, nobody on call two weeks running) and let the team decide.",
        grade: "strong",
        then: "You keep authority over what you answer for and hand over the rest. It is the coaching move: ask more, tell less.",
        row: 5,
        set: { cont: 6 },
      },
    ],
  },
  {
    sheet: "s20",
    role: "You are a product manager looking for your next role inside a 5,000-person company.",
    setup: "Your close friends at work are all on your own team. Someone you met once at an offsite works in the strategy group you would love to join.",
    ask: "Who do you ask first?",
    fw: "ties",
    moves: "The network above shows who you can reach within two steps.",
    choices: [
      {
        says: "Your close friends on your own team.",
        grade: "tradeoff",
        then: "They will help gladly, but they know what you know. Granovetter: new information travels on weak ties.",
        row: 2,
        set: { net: "close" },
      },
      {
        says: "The acquaintance in the strategy group.",
        grade: "strong",
        then: "One weak tie across the gap puts three more people within two steps. In Rajkumar and colleagues’ LinkedIn experiment, moderately weak ties helped job moves the most.",
        row: 1,
        set: { net: "bridge" },
      },
      {
        says: "Post on the internal job board and wait.",
        grade: "costly",
        then: "You reach no one new, and the people who could tell you about the role before it is posted never hear you are looking.",
        row: 2,
        set: { net: "close" },
      },
    ],
  },
  {
    sheet: "s21",
    role: "You are a manager in the United States leading a project with a team in Japan.",
    setup: "Your Tokyo counterpart said your plan “may be a little difficult.” You took it as a yes. Two weeks later, the work has not started.",
    ask: "What do you do now?",
    fw: "culture-map",
    moves: "The culture scale above shows the communicating gap between the two of you.",
    choices: [
      {
        says: "Escalate to their manager.",
        grade: "costly",
        then: "On Meyer’s map you sit far apart on communicating: in a high-context culture, “a little difficult” was a clear no. Escalating turns a misread into a loss of face.",
        row: 0,
        set: { "cm-k": 0, cm: scales(0, 2, 8) },
      },
      {
        says: "Call, ask open questions about what makes it difficult, and agree how each of you will say no from now on.",
        grade: "strong",
        then: "Meyer: compare positions, not absolutes. Naming the gap out loud and agreeing how you will flag problems closes it on purpose.",
        row: 0,
        set: { "cm-k": 0, cm: scales(0, 2, 8) },
      },
      {
        says: "Write the next plan in much more detail.",
        grade: "tradeoff",
        then: "More detail helps a low-context reader, which is you. The misread was in what was not said.",
        row: 0,
        set: { "cm-k": 0, cm: scales(0, 2, 8) },
      },
    ],
  },
  {
    sheet: "s22",
    role: "You are 18 months and $3 million into a software rebuild that was meant to take a year.",
    setup: "The team says six more months will finish it. They said that six months ago. You championed the project to the board.",
    ask: "What do you do?",
    fw: "escalation",
    choices: [
      {
        says: "Approve six more months. You are too close to stop now.",
        grade: "costly",
        then: "Staw found that the people personally responsible for a decision that went badly put the most new money into it. The pull is to justify the first choice.",
        row: 1,
      },
      {
        says: "Ask: if we were starting today, knowing what we know, would we fund this? Get the answer from someone who did not champion it.",
        grade: "strong",
        then: "The check that breaks escalation: judge the next dollar on its own merits. Someone without your stake in the project can see it.",
        row: 2,
      },
      {
        says: "Add more engineers to speed it up.",
        grade: "costly",
        then: "More money into the course you chose, without asking whether it is still the right one. It is escalation with a bigger budget.",
        row: 1,
      },
    ],
  },
  {
    sheet: "s23",
    role: "You run a weekly operations review with twelve people. The same three always talk.",
    setup: "In a skip-level chat, a quiet analyst tells you she spotted the cause of last month’s outage a week early, but “didn’t think it was her place” to raise it.",
    ask: "What do you change?",
    fw: "silence",
    choices: [
      {
        says: "Tell everyone at the next review that your door is always open.",
        grade: "tradeoff",
        then: "Detert and Edmondson: people censor themselves by unspoken rules, and “my door is open” does not touch them. It is a start, not a fix.",
        row: 3,
      },
      {
        says: "Open each review by asking two quieter people what they are seeing, and act visibly on at least one point.",
        grade: "strong",
        then: "Silence is the default; voice is made safe by small signals, repeated. Acting on what you hear answers the belief that nothing will change.",
        row: 2,
      },
      {
        says: "Nothing. People who want to speak up will.",
        grade: "costly",
        then: "Most of the people Milliken and colleagues interviewed had held back a concern from a supervisor. Waiting for voice to appear means hearing about the outage after it happens.",
        row: 0,
      },
    ],
  },
  {
    sheet: "s24",
    role: "You have said your top three goals this year are to develop your team, ship the platform, and be home for dinner.",
    setup: "Last week you spent 6 hours on the first, 4 on the second, 2 on the third and 38 on everything else. Now a peer asks you to “just help” with their reorganization, about 10 hours next week.",
    ask: "What do you say?",
    fw: "hundred",
    moves: "The week audit above shows next week’s hours.",
    choices: [
      {
        says: "Yes. It is only one week.",
        grade: "costly",
        then: "Christensen’s marginal-cost trap: each exception looks cheap. Your top three goals drop to 20% of the week.",
        row: 1,
        set: { week: [6, 4, 2, 48] },
      },
      {
        says: "Yes, and make up the hours at night.",
        grade: "costly",
        then: "Your calendar is your real strategy: the hours come out of being home for dinner. Your top three goals fall to 17% of the week.",
        row: 0,
        set: { week: [6, 4, 0, 48] },
      },
      {
        says: "No, but offer one hour to review their plan, and move two meetings to time with your team.",
        grade: "strong",
        then: "Decide once and hold the line; it is easier than arguing it again every week. Your top three goals rise to 27%.",
        row: 2,
        set: { week: [8, 4, 2, 37] },
      },
    ],
  },
  {
    sheet: "s12",
    role: "It is week six of a hard launch.",
    setup: "You are sleeping five hours, eating at your desk and snapping at people in standups. Your best engineer just asked if you are OK.",
    ask: "What do you change this week?",
    fw: "energy-4",
    moves: "The energy check above ticks what is still true after your choice.",
    choices: [
      {
        says: "Nothing until launch. Then take a week off.",
        grade: "costly",
        then: "Schwartz and McCarthy: energy is renewed by small, regular rituals, not one long rest at the end. Until then, the team gets the impatient version of you.",
        row: 0,
        set: { en: { 0: true, 1: true, 2: true, 3: true, 4: true, 5: true } },
      },
      {
        says: "Start two rituals: a real lunch away from your desk and a short afternoon walk. And tell the engineer what you appreciate about them.",
        grade: "strong",
        then: "Physical and emotional energy start to come back. Sleep is still short, and the mental gaps now show as the lowest, so next week, protect one focused block.",
        row: 0,
        set: { en: { 0: true, 4: true, 5: true } },
      },
      {
        says: "Hand the standups to a deputy for two weeks.",
        grade: "tradeoff",
        then: "It protects the team from your short temper, which is kind. It treats the symptom: you are still sleeping five hours and skipping breaks.",
        row: 1,
        set: { en: { 0: true, 1: true, 3: true, 4: true, 5: true } },
      },
    ],
  },
]

export const caseFor = (sheet: string) => CASES.find((c) => c.sheet === sheet)

/** Every lab key any choice in the case writes, so the visitor's own values can be saved first and put back. */
export const caseKeys = (c: Case) => [...new Set(c.choices.flatMap((ch) => [...Object.keys(ch.set ?? {}), ...Object.keys(ch.seed ?? {})]))]
