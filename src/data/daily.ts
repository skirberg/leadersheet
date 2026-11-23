/*
  Today's call: one decision a day, the same for everyone on the same calendar day, like a daily puzzle. Call #1 is
  20 November 2026. The calls go round the lesson cases (cases.ts, every claim already sourced) seven lessons at a
  step, so neighbouring days come from different parts of the course; 7 and the number of cases share no factor, so
  every case comes up once before any repeats. The day is the visitor's own, as the streak's is (store.tsx).
*/
export const FIRST_CALL = new Date(2026, 10, 20)
export const STEP = 7

const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

/** Today's call number on the visitor's calendar: 1 on 20 November 2026. Rounded, so a daylight-saving day still counts as one. */
export function callNumber(now = new Date()) {
  return Math.max(1, Math.round((dayStart(now).getTime() - FIRST_CALL.getTime()) / 86_400_000) + 1)
}

/** Which case a call number gets, out of `count` (kept free of imports so the smoke test can load it in plain Node). */
export function callIndex(n: number, count: number) {
  return ((((n - 1) * STEP) % count) + count) % count
}

/**
 * callNumber and callIndex as a script the page runs while it loads, before any bundle: it shows the visitor's own day's
 * case from the ones Today's call paints hidden (CallPreviews), and writes the day's line. Same arithmetic, so
 * test/daily.test.ts runs both over two years of days. Built from the constants above, never typed in twice.
 */
export const callScript = (count: number) =>
  `(function(){var d=new Date(),f=new Date(${FIRST_CALL.getFullYear()},${FIRST_CALL.getMonth()},${FIRST_CALL.getDate()}),` +
  `n=Math.max(1,Math.round((new Date(d.getFullYear(),d.getMonth(),d.getDate())-f)/864e5)+1),` +
  `i=(((n-1)*${STEP})%${count}+${count})%${count},e=document.querySelector('[data-call="'+i+'"]');if(!e)return;e.hidden=false;` +
  `var l=e.querySelector("[data-call-no]");if(l)l.textContent="No. "+n+" \u00b7 "+d.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})})()`

/** How long until the next call, in whole minutes, on the visitor's clock. */
export function minutesToNext(now = new Date()) {
  const next = dayStart(now)
  next.setDate(next.getDate() + 1)
  return Math.max(1, Math.ceil((next.getTime() - now.getTime()) / 60_000))
}

export const SURE = ["Sure", "Fairly sure", "Guessing"] as const
export type Sure = (typeof SURE)[number]
