import { AbsoluteFill, Easing, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion"

/*
  Session recap film, generated from the session's own data.
  1280 x 720, 30 fps, 16 s. Five beats: sheet, idea, readings, frameworks, your move.
*/
export const SESSION_FILM = { width: 1280, height: 720, fps: 30, durationInFrames: 480 }

export type SessionFilmProps = {
  sheet: string
  date: string
  part: string
  title: string
  idea: string
  readings: { by: string; idea: string }[]
  frameworks: string[]
  prompt: string
}

const mono = "var(--font-martian), ui-monospace, monospace"
const sans = "var(--font-bricolage), system-ui, sans-serif"
const ease = Easing.bezier(0.2, 0.7, 0.2, 1)
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ font: `500 17px ${mono}`, letterSpacing: "0.1em", color: "var(--muted-foreground)", textTransform: "uppercase" }}>{children}</div>
}

/** Fades a beat in and out inside its own Sequence. */
function Beat({ dur, children }: { dur: number; children: React.ReactNode }) {
  const f = useCurrentFrame()
  const o = interpolate(f, [0, 10, dur - 10, dur], [0, 1, 1, 0], clamp)
  const y = interpolate(f, [0, 14], [18, 0], { ...clamp, easing: ease })
  return (
    <AbsoluteFill style={{ padding: "120px 110px 90px", opacity: o, transform: `translateY(${y}px)` }}>{children}</AbsoluteFill>
  )
}

function Words({ text, size, start = 0, per = 2.2, weight = 600 }: { text: string; size: number; start?: number; per?: number; weight?: number }) {
  const f = useCurrentFrame()
  return (
    <div style={{ font: `${weight} ${size}px/1.12 ${sans}`, letterSpacing: "-0.015em", color: "var(--foreground)", textWrap: "balance" }}>
      {text.split(" ").map((w, i) => {
        const t = interpolate(f - start - i * per, [0, 10], [0, 1], { ...clamp, easing: ease })
        return (
          <span key={i} style={{ display: "inline-block", opacity: t, transform: `translateY(${(1 - t) * 14}px)`, marginRight: "0.26em" }}>
            {w}
          </span>
        )
      })}
    </div>
  )
}

function Underline({ start, width }: { start: number; width: number }) {
  const f = useCurrentFrame()
  const off = interpolate(f, [start, start + 22], [1, 0], { ...clamp, easing: ease })
  return (
    <svg width={width} height={16} viewBox="0 0 300 14" preserveAspectRatio="none" style={{ display: "block", marginTop: 6, overflow: "visible" }}>
      <path d="M3 9.5C46 5 92 11 141 6.8S236 5.2 297 7.5" stroke="var(--signal)" strokeWidth={4.5} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={off} />
    </svg>
  )
}

export function SessionFilm(p: SessionFilmProps) {
  const f = useCurrentFrame()
  const { fps } = useVideoConfig()
  const corner = spring({ frame: f, fps, config: { damping: 15, stiffness: 150 } })
  const fws = p.frameworks.slice(0, 4)
  return (
    <AbsoluteFill style={{ background: "var(--card)", color: "var(--foreground)" }}>
      <svg width="100%" height="100%" viewBox="0 0 1280 720" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <pattern id="sf-minor" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" fill="none" stroke="var(--grid)" strokeWidth="1" />
          </pattern>
          <pattern id="sf-major" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="url(#sf-minor)" />
            <path d="M100 0H0V100" fill="none" stroke="var(--grid)" strokeWidth="1.5" />
          </pattern>
        </defs>
        <rect width="1280" height="720" fill="url(#sf-major)" />
        {[
          [44, 44, 1, 1],
          [1236, 44, -1, 1],
          [1236, 676, -1, -1],
          [44, 676, 1, -1],
        ].map(([x, y, dx, dy], i) => {
          const off = (1 - corner) * 30
          return <path key={i} d={`M${x - dx * off} ${y - dy * off + dy * 28}V${y - dy * off}H${x - dx * off + dx * 28}`} stroke="var(--foreground)" strokeWidth={3} fill="none" />
        })}
      </svg>
      {/* persistent title strip */}
      <div style={{ position: "absolute", top: 64, left: 110, right: 110, display: "flex", justifyContent: "space-between", font: `500 16px ${mono}`, letterSpacing: "0.1em", color: "var(--muted-foreground)" }}>
        <span>SHEET {p.sheet}{p.date ? ` · ${p.date}` : ""}</span>
        <span>{p.part.toUpperCase()}</span>
      </div>
      <div style={{ position: "absolute", bottom: 60, left: 110, right: 110, height: 3, background: "var(--border)", borderRadius: 2 }}>
        <div style={{ width: `${(f / 479) * 100}%`, height: "100%", background: "var(--foreground)", borderRadius: 2 }} />
      </div>

      <Sequence durationInFrames={100} layout="none">
        <Beat dur={100}>
          <div style={{ marginTop: 110 }}>
            <Label>Session {p.sheet.slice(1)}</Label>
            <div style={{ marginTop: 18, display: "inline-block" }}>
              <Words text={p.title} size={96} start={4} per={4} weight={650} />
              <Underline start={30} width={Math.min(980, p.title.length * 44)} />
            </div>
          </div>
        </Beat>
      </Sequence>

      <Sequence from={100} durationInFrames={125} layout="none">
        <Beat dur={125}>
          <div style={{ marginTop: 40, display: "grid", gap: 26 }}>
            <Label>The idea</Label>
            <Words text={p.idea} size={p.idea.length > 120 ? 50 : 58} start={6} per={1.8} />
          </div>
        </Beat>
      </Sequence>

      <Sequence from={225} durationInFrames={120} layout="none">
        <Beat dur={120}>
          <div style={{ marginTop: 20, display: "grid", gap: 26 }}>
            <Label>Readings</Label>
            <ReadingCards readings={p.readings.slice(0, 2)} />
          </div>
        </Beat>
      </Sequence>

      <Sequence from={345} durationInFrames={80} layout="none">
        <Beat dur={80}>
          <div style={{ marginTop: 20, display: "grid", gap: 26 }}>
            <Label>Frameworks on this sheet</Label>
            <FrameworkTree names={fws} sheet={p.sheet} />
          </div>
        </Beat>
      </Sequence>

      <Sequence from={425} durationInFrames={55} layout="none">
        <Beat dur={70}>
          <div style={{ marginTop: 40, display: "grid", gap: 26 }}>
            <Label>Think it through</Label>
            <Words text={p.prompt} size={52} start={2} per={1.2} />
          </div>
        </Beat>
      </Sequence>
    </AbsoluteFill>
  )
}

function ReadingCards({ readings }: { readings: { by: string; idea: string }[] }) {
  const f = useCurrentFrame()
  return (
    <div style={{ display: "grid", gap: 22 }}>
      {readings.map((r, i) => {
        const t = interpolate(f - 8 - i * 18, [0, 18], [0, 1], { ...clamp, easing: ease })
        return (
          <div key={i} style={{ opacity: t, transform: `translateX(${(1 - t) * 60}px)`, borderLeft: "4px solid var(--foreground)", padding: "8px 0 8px 26px" }}>
            <div style={{ font: `500 18px ${mono}`, letterSpacing: "0.06em", color: "var(--muted-foreground)" }}>{r.by.toUpperCase()}</div>
            <div style={{ font: `600 ${readings.length > 1 ? 36 : 44}px/1.18 ${sans}`, marginTop: 8, letterSpacing: "-0.01em", textWrap: "balance" }}>{r.idea}</div>
          </div>
        )
      })}
    </div>
  )
}

function FrameworkTree({ names, sheet }: { names: string[]; sheet: string }) {
  const f = useCurrentFrame()
  const W = 1060,
    n = names.length
  const xs = names.map((_, i) => (W / n) * (i + 0.5))
  const draw = interpolate(f, [8, 30], [1, 0], { ...clamp, easing: ease })
  return (
    <svg width={W} height={330} viewBox={`0 0 ${W} 330`} style={{ overflow: "visible" }}>
      <rect x={W / 2 - 90} y={10} width={180} height={56} rx={6} fill="var(--signal)" />
      <text x={W / 2} y={46} textAnchor="middle" style={{ font: `600 24px ${sans}`, fill: "var(--signal-foreground)" }}>
        Sheet {sheet}
      </text>
      {xs.map((x, i) => (
        <path key={i} d={`M${W / 2} 66 C${W / 2} 120 ${x} 110 ${x} 168`} stroke="var(--foreground)" strokeWidth={2.5} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={draw} />
      ))}
      {names.map((nm, i) => {
        const t = interpolate(f - 18 - i * 5, [0, 12], [0, 1], { ...clamp, easing: ease })
        const bw = W / n - 24
        return (
          <foreignObject key={i} x={xs[i] - bw / 2} y={168} width={bw} height={150} opacity={t}>
            <div style={{ border: "2.5px solid var(--foreground)", borderRadius: 6, background: "var(--card)", padding: "14px 16px", font: `600 ${n > 3 ? 23 : 27}px/1.15 ${sans}`, color: "var(--foreground)", textAlign: "center", textWrap: "balance" }}>
              {nm}
            </div>
          </foreignObject>
        )
      })}
    </svg>
  )
}
