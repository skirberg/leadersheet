import Link from "next/link"

/*
  The row of tilted lesson cards under the home headline, the way Brilliant shows a strip of real
  problems. Each card is one lesson's question with its drawing, and opens that lesson.
*/
const BLUE = "#6f8dff"
const YELLOW = "#f6c94e"
const PINK = "var(--signal)"
const INK = "#000"
const LINE = "#d9d6d2"

type Card = { href: string; prompt: string; art: React.ReactNode }

const node = (x: number, y: number, r = 6, fill = "#fff") => <circle cx={x} cy={y} r={r} fill={fill} stroke={INK} strokeWidth={2} />

const CARDS: Card[] = [
  {
    href: "/learn/s3/",
    prompt: "Pick the structure that fits.",
    art: (
      <g fill="none" stroke={INK} strokeWidth={2}>
        <rect x={62} y={14} width={56} height={24} rx={6} fill={BLUE} stroke="none" />
        <path d="M90 38V54M36 54H144M36 54V68M90 54V68M144 54V68" />
        {[36, 90, 144].map((x) => (
          <rect key={x} x={x - 22} y={68} width={44} height={20} rx={5} fill="#fff" />
        ))}
        <path d="M24 88V104M48 88V104M78 88V104M102 88V104M132 88V104M156 88V104" />
        {[24, 48, 78, 102, 132, 156].map((x) => (
          <circle key={x} cx={x} cy={110} r={6} fill="#fff" />
        ))}
      </g>
    ),
  },
  {
    href: "/learn/s4/",
    prompt: "Where does your team’s culture sit?",
    art: (
      <g>
        <rect x={20} y={10} width={140} height={110} rx={8} fill="#fff" stroke={LINE} strokeWidth={2} />
        <path d="M90 10V120M20 65H160" stroke={LINE} strokeWidth={2} />
        <rect x={20} y={10} width={70} height={55} rx={8} fill={YELLOW} opacity={0.55} />
        {[[46, 30], [120, 28], [140, 50], [40, 86], [62, 106], [132, 98]].map(([x, y], i) => (
          <g key={i}>{node(x, y, 5)}</g>
        ))}
        <circle cx={64} cy={42} r={10} fill={PINK} />
      </g>
    ),
  },
  {
    href: "/learn/s2/",
    prompt: "High standards, high safety. Which zone?",
    art: (
      <g>
        <path d="M24 118V12M24 118H164" stroke={INK} strokeWidth={2} fill="none" />
        <rect x={94} y={12} width={70} height={53} rx={6} fill={BLUE} />
        <rect x={26} y={12} width={66} height={53} rx={6} fill="#efedea" />
        <rect x={26} y={67} width={66} height={49} rx={6} fill="#efedea" />
        <rect x={94} y={67} width={70} height={49} rx={6} fill="#efedea" />
        <text x={129} y={43} textAnchor="middle" fontSize={13} fontWeight={600} fill="#fff">Learning</text>
        <text x={59} y={43} textAnchor="middle" fontSize={11} fill="#555">Comfort</text>
        <text x={59} y={96} textAnchor="middle" fontSize={11} fill="#555">Apathy</text>
        <text x={129} y={96} textAnchor="middle" fontSize={11} fill="#555">Anxiety</text>
      </g>
    ),
  },
  {
    href: "/learn/s7/",
    prompt: "How do you handle a fight?",
    art: (
      <g>
        <path d="M24 118V12M24 118H164" stroke={INK} strokeWidth={2} fill="none" />
        {[[50, 98], [140, 98], [95, 66], [50, 32], [140, 32]].map(([x, y], i) => (
          <g key={i}>{node(x, y, 7)}</g>
        ))}
        <circle cx={140} cy={32} r={12} fill={PINK} />
        <path d="M95 66L134 37" stroke={PINK} strokeWidth={2} strokeDasharray="4 4" />
      </g>
    ),
  },
  {
    href: "/learn/s5/",
    prompt: "Put Kotter’s eight steps in order.",
    art: (
      <g>
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x={22 + i * 18} y={110 - (i + 1) * 12} width={14} height={(i + 1) * 12} rx={3} fill={i === 7 ? PINK : i < 5 ? INK : YELLOW} />
        ))}
        <path d="M18 112H166" stroke={INK} strokeWidth={2} />
      </g>
    ),
  },
  {
    href: "/learn/s11/",
    prompt: "Walk back down the ladder of inference.",
    art: (
      <g fill="none" stroke={INK} strokeWidth={2}>
        <path d="M64 120L80 8M116 120L132 8" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path key={i} d={`M${66 + i * 2.6} ${106 - i * 18}H${118 + i * 2.6}`} stroke={i === 4 ? BLUE : INK} strokeWidth={i === 4 ? 4 : 2} />
        ))}
        <circle cx={98} cy={28} r={9} fill={PINK} stroke="none" />
        <path d="M150 30C164 54 162 86 146 108" stroke={BLUE} strokeDasharray="4 5" />
        <path d="M146 108l-2-10M146 108l9-5" stroke={BLUE} />
      </g>
    ),
  },
  {
    href: "/learn/s8/",
    prompt: "Spot the bias before the clock runs out.",
    art: (
      <g>
        <circle cx={90} cy={70} r={46} fill="#fff" stroke={INK} strokeWidth={3} />
        <path d="M90 70V36" stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <path d="M90 70L114 84" stroke={PINK} strokeWidth={4} strokeLinecap="round" />
        <path d="M78 12H102M90 12V24" stroke={INK} strokeWidth={4} />
        <path d="M90 24A46 46 0 0 1 136 70L90 70Z" fill={YELLOW} opacity={0.6} />
      </g>
    ),
  },
]

export function HeroCards() {
  return (
    <div className="relative w-full overflow-hidden px-4 pt-6 pb-16 sm:px-6 lg:pb-24" aria-label="Questions from the lessons">
      <ol className="pointer-events-auto flex justify-center gap-3 [perspective:1400px] sm:gap-4">
        {CARDS.map((c, i) => (
          <li
            key={c.href}
            className="shrink-0"
            style={{ transform: `rotateY(-24deg) rotateX(6deg) translateY(${(3 - i) * 14}px)`, transformStyle: "preserve-3d" }}
          >
            <Link
              href={c.href}
              className="flex h-[200px] w-[140px] flex-col gap-2 rounded-[24px] bg-card p-3.5 sm:h-[248px] sm:w-[184px] sm:gap-3 sm:rounded-[28px] sm:p-4 shadow-[0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-12px_rgb(0_0_0/0.12)] transition-transform duration-200 ease-(--ease-draft) hover:-translate-y-1 sm:w-[184px]"
            >
              <span className="text-[12px] leading-snug text-muted-foreground sm:text-[13px]">{c.prompt}</span>
              <svg viewBox="0 0 180 130" className="mt-auto w-full" aria-hidden>
                {c.art}
              </svg>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  )
}
