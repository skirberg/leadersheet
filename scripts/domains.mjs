// Domain availability, straight from each registry (RDAP), with whois for TLDs that have no RDAP.
// usage: node scripts/domains.mjs name1,name2 com,app,io,so,co,study,fun
//    or: node scripts/domains.mjs lead.ing,leader.sh,leade.rs   (exact domains, for hacks)
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
// whois fallback: ask IANA for the TLD's own registry server, then ask that server.
// Answers that match neither pattern come back as "?" so a guess is never shown as "free".
const whoisServer = {}
function registryWhois(t) {
  if (!(t in whoisServer)) {
    try {
      const iana = execFileSync("whois", ["-h", "whois.iana.org", t], { encoding: "utf8", timeout: 15000 })
      whoisServer[t] = iana.match(/^whois:\s*(\S+)/im)?.[1] ?? null
    } catch {
      whoisServer[t] = null
    }
  }
  return whoisServer[t]
}
function whois(d) {
  const server = registryWhois(d.split(".").at(-1))
  if (!server) return "?no-whois"
  try {
    const out = execFileSync("whois", ["-h", server, d], { encoding: "utf8", timeout: 20000 })
    if (/Creation Date|Registry Expiry|Registered on|Registrar:|Domain Status:\s*\w/i.test(out)) return "taken"
    if (/No Object Found|NOT FOUND|Domain not found|No match|No Data Found|is available|no entries found/i.test(out)) return "free"
  } catch {}
  return "?"
}

// Exact domains (anything with a dot) are checked one per line, for domain hacks like lead.ing.
if (names.some((n) => n.includes("."))) {
  for (const d of names) {
    const t = d.split(".").at(-1)
    console.log(d.padEnd(22), base[t] ? await rdap(d, t) : whois(d))
    await sleep(300)
  }
} else
  for (const n of names) {
    const row = []
    for (const t of tlds) {
      row.push(`${t}:${base[t] ? await rdap(`${n}.${t}`, t) : whois(`${n}.${t}`)}`)
      await sleep(300)
    }
    console.log(n.padEnd(14), row.join("  "))
  }
