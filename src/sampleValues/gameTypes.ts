import type { GameTypeStructure } from "src/entities/gameType.js";

export const gameTypes: readonly GameTypeStructure[] = [
  { type: "tutorial", boardSize: "small" },
  { type: "mini", boardSize: "small" },
  { type: "standard", boardSize: "standard" },
];
