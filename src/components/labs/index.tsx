"use client"

import { CultureLab, EiLab, ManageLab, StructureLab } from "./labs-a"
import { ConflictLab, DecisionLab, KotterLab, TeamLab } from "./labs-b"
import { EnergyLab, LadderLab, MotivationLab, TapLab } from "./labs-c"

const LABS: Record<string, () => React.ReactNode> = {
  manage: ManageLab,
  ei: EiLab,
  structure: StructureLab,
  culture: CultureLab,
  kotter: KotterLab,
  team: TeamLab,
  conflict: ConflictLab,
  decision: DecisionLab,
  tap: TapLab,
  motivation: MotivationLab,
  ladder: LadderLab,
  energy: EnergyLab,
}

export function SessionLab({ lab }: { lab: string }) {
  const L = LABS[lab]
  return L ? <L /> : null
}
