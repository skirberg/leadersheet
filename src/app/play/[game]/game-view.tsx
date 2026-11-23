"use client"

import { BiasGame, ClimbGame, ConflictGame, CultureGame, StyleQuizGame, ValuesGame } from "@/components/play/games"
import { DecideGame } from "@/components/play/decide"
import { TeamMathGame } from "@/components/play/team-math"
import { JobSurvey } from "@/components/play/job-survey"
import { RewindGame } from "@/components/play/rewind"
import { NetworkMap } from "@/components/play/network-map"
import { BounceSurvey } from "@/components/play/bounce"
import type { GameId } from "@/data/games"

export function GameView({ id }: { id: GameId }) {
  if (id === "team") return <TeamMathGame />
  if (id === "decide") return <DecideGame />
  if (id === "culture") return <CultureGame />
  if (id === "conflict") return <ConflictGame />
  if (id === "style" || id === "power" || id === "listen") return <StyleQuizGame id={id} />
  if (id === "values") return <ValuesGame />
  if (id === "job") return <JobSurvey />
  if (id === "rewind") return <RewindGame />
  if (id === "network") return <NetworkMap />
  if (id === "bounce") return <BounceSurvey />
  if (id === "bias") return <BiasGame />
  return <ClimbGame />
}
