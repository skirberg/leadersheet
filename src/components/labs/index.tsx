"use client"

import { FirstUse } from "@/components/site/first-use"
import { CultureLab, EiLab, ManageLab, StructureLab } from "./labs-a"
import { ConflictLab, DecisionLab, KotterLab, TeamLab } from "./labs-b"
import { EnergyLab, LadderLab, MotivationLab, TapLab } from "./labs-c"
import { CoachLab, CrisisLab, CulturesLab, EthicsLab, FullRangeLab, NegotiateLab, NetworkLab, PairsLab, PowerLab, ReplyLab, SelfLab, StylesLab, TrustLab, VoiceLab } from "./labs-d"

function ListeningLabs() {
  return (
    <div className="grid gap-6">
      <TapLab />
      <ReplyLab />
      <PairsLab />
    </div>
  )
}

const LABS: Record<string, () => React.ReactNode> = {
  manage: ManageLab,
  ei: EiLab,
  structure: StructureLab,
  culture: CultureLab,
  kotter: KotterLab,
  team: TeamLab,
  conflict: ConflictLab,
  decision: DecisionLab,
  tap: ListeningLabs,
  motivation: MotivationLab,
  ladder: LadderLab,
  energy: EnergyLab,
  power: PowerLab,
  styles: StylesLab,
  fullrange: FullRangeLab,
  trust: TrustLab,
  ethics: EthicsLab,
  negotiate: NegotiateLab,
  coach: CoachLab,
  network: NetworkLab,
  cultures: CulturesLab,
  crisis: CrisisLab,
  voice: VoiceLab,
  self: SelfLab,
}

export function SessionLab({ lab }: { lab: string }) {
  const L = LABS[lab]
  return L ? (
    <FirstUse event="Lab used" props={{ lab }}>
      <L />
    </FirstUse>
  ) : null
}
