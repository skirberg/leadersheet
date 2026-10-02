// Domain availability, straight from each registry (RDAP), with whois for TLDs that have no RDAP.
// usage: node scripts/domains.mjs name1,name2 com,app,io,so,co,study,fun
// "free" means unregistered. It does not mean purchasable at standard price: premium and reserved
// names look the same here. Check price at a registrar before you fall in love.
import { execFileSync } from "node:child_process"

const [names, tlds] = [process.argv[2], process.argv[3] ?? "com,app,io,so,co,study,school,fun,club,team,page"].map((s) => s.split(","))
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const boot = await (await fetch("https://data.iana.org/rdap/dns.json")).json()
const base = {}
for (const [ts, urls] of boot.services) for (const t of ts) base[t] = urls.at(-1).replace(/\/?$/, "/")

async function rdap(d, t) {
  for (let i = 0; i < 3; i++) {
    const r = await fetch(base[t] + "domain/" + d, { headers: { Accept: "application/rdap+json" } }).catch(() => null)
    if (!r) continue
    if (r.status === 200) return "taken"
    if (r.status === 404) return "free"
    if (r.status === 429) await sleep(2000 * (i + 1))
    else return `?${r.status}`
  }
  return "?"
}
function whois(d) {
  try {
    const out = execFileSync("whois", [d], { encoding: "utf8", timeout: 15000 })
    if (/No Object Found|NOT FOUND|Domain not found|No match|No Data Found|is available/i.test(out)) return "free"
    if (/Creation Date|Registry Expiry|Domain Status/i.test(out)) return "taken"
  } catch {}
  return "?"
}
for (const n of names) {
  const row = []
  for (const t of tlds) {
    row.push(`${t}:${base[t] ? await rdap(`${n}.${t}`, t) : whois(`${n}.${t}`)}`)
    await sleep(300)
  }
  console.log(n.padEnd(14), row.join("  "))
}
