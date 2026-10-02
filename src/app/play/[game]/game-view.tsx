"use client"

import { BiasGame, ClimbGame, ConflictGame, CultureGame } from "@/components/play/games"
import type { GameId } from "@/data/games"

export function GameView({ id }: { id: GameId }) {
  if (id === "culture") return <CultureGame />
  if (id === "conflict") return <ConflictGame />
  if (id === "bias") return <BiasGame />
  return <ClimbGame />
}
