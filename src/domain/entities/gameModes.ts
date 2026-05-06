import type { BoardType } from "./board";
import { boardType } from "./board";
import { z } from "zod";

export const gameModeNames = ["tutorial", "mini", "standard", "epic"] as const;

export type GameModeName = (typeof gameModeNames)[number];

export interface GameMode {
  name: GameModeName;
  boardSize: BoardType;
}

export const gameModes: readonly GameMode[] = [
  { name: "tutorial", boardSize: "small" },
  { name: "mini", boardSize: "small" },
  { name: "standard", boardSize: "standard" },
  { name: "epic", boardSize: "large" },
];

export interface TutorialGameMode extends GameMode {
  name: "tutorial";
  boardSize: "small";
}

export interface MiniGameMode extends GameMode {
  name: "mini";
  boardSize: "small";
}

export interface StandardGameMode extends GameMode {
  name: "standard";
  boardSize: "standard";
}

export interface EpicGameMode extends GameMode {
  name: "epic";
  boardSize: "large";
}

export const gameModeSchema: z.ZodType<GameMode> = z.object({
  name: z.enum(gameModeNames),
  boardSize: z.enum(boardType),
});
