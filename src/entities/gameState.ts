import type { AssertExact } from "src/utils/assertExact.js";
import type { Board, BoardSchemaType } from "./board/board.js";
import type { CardState } from "./card/cardState.js";
import type { PlayerSide } from "./player/playerSide.js";
import type { Phase } from "./sequence/phases.js";

import type { EngagedUnitPresence } from "./unitPresence/engagedUnitPresence.js";
import { z } from "zod";
import { boardSchema } from "./board/board.js";
import { cardStateSchema } from "./card/cardState.js";
import { playerSideSchema } from "./player/playerSide.js";
import { phaseSchema } from "./sequence/phases.js";
import { engagedUnitPresenceSchema } from "./unitPresence/engagedUnitPresence.js";

/** The schema for a game state. */
export const gameStateSchema = z.object({
  currentRound: z.number().int().min(0),
  currentPhase: phaseSchema,
  initiative: playerSideSchema,
  playerTurn: playerSideSchema.nullable(),
  remainingEngagements: z.set(engagedUnitPresenceSchema),
  boardState: boardSchema,
  cardState: cardStateSchema,
});

// Helper type to check match of type against schema
// Override boardState with strict coordinate types
type GameStateSchemaType = Omit<
  z.infer<typeof gameStateSchema>,
  "boardState"
> & {
  boardState: BoardSchemaType;
};

/** The state of a game of Prevail: Ancient Battles. */
export interface GameState {
  currentRound: number;
  currentPhase: Phase;
  initiative: PlayerSide;
  playerTurn: PlayerSide | null;
  remainingEngagements: Set<EngagedUnitPresence>;
  boardState: Board;
  cardState: CardState;
}

/** Helper function to assert that a value matches the schema. */
const _assertExactGameState: AssertExact<GameState, GameStateSchemaType> = true;
