/*
  Sheet numbers, dates and the schedule, with no course content in them,
  so client code can use them without shipping the whole course to the browser. course.ts re-exports them.
*/

/** One sheet's place in the schedule: all the client needs to work out this week. */
export type ScheduleEntry = { id: string; n: number; date: string }

const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const parse = (s: string) => {
  const [y, m, d] = s.split("-").map(Number)
  return new Date(y, m - 1, d)
}
export const fmt = (s: string) => {
  const x = parse(s)
  return `${MON[x.getMonth()]} ${x.getDate()}`
}
export const fmtMono = (s: string) => {
  const x = parse(s)
  return `${String(x.getDate()).padStart(2, "0")} ${MON[x.getMonth()].toUpperCase()}`
}
export const todayStr = (t = new Date()) =>
  `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`

/** The next class on or after today, or the last one once the term is over. */
export const currentOf = <T extends { date: string }>(list: T[], today = todayStr()) =>
  list.find((s) => s.date >= today) ?? list[list.length - 1]

export const sheetNo = (n: number) => `S${String(n).padStart(2, "0")}`
