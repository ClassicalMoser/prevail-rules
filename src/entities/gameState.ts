import type { AssertExact } from "src/utils/assertExact.js";
import type { Board, BoardSchemaType } from "./board/board.js";
import type { CardState } from "./card/cardState.js";
import type { Command } from "./card/command.js";
import type { PlayerSide } from "./player/playerSide.js";

import type { Phase } from "./sequence/phases.js";
import type { UnitInstance } from "./unit/unitInstance.js";
import type { EngagedUnitPresence } from "./unitPresence/engagedUnitPresence.js";
import { z } from "zod";
import { boardSchema } from "./board/board.js";
import { cardStateSchema } from "./card/cardState.js";
import { commandSchema } from "./card/command.js";
import { playerSideSchema } from "./player/playerSide.js";
import { phaseSchema } from "./sequence/phases.js";
import { unitInstanceSchema } from "./unit/unitInstance.js";
import { engagedUnitPresenceSchema } from "./unitPresence/engagedUnitPresence.js";

/** The schema for a game state. */
export const gameStateSchema = z.object({
  /** The current round number of the game. */
  currentRound: z.number().int().min(0),
  /** The current phase of the game. */
  currentPhase: phaseSchema,
  /** Which player currently has initiative. */
  initiative: playerSideSchema,
  /** Which player is currently taking their turn. */
  playerTurn: playerSideSchema.nullable(),
  /** The ranged attacks that are still due to be resolved this phase. */
  remainingRangedAttacks: z.set(unitInstanceSchema),
  /** The commands that are still due to be resolved this phase. */
  remainingCommands: z.set(commandSchema),
  /** The units that are still eligible to be moved this phase. */
  remainingMovements: z.set(unitInstanceSchema),
  /** The engagements that are still due to be resolved this phase. */
  remainingEngagements: z.set(engagedUnitPresenceSchema),
  /** The state of the board. */
  boardState: boardSchema,
  /** The state of both players' cards. */
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
  /** The current round number of the game. */
  currentRound: number;
  /** The current phase of the game. */
  currentPhase: Phase;
  /** Which player currently has initiative. */
  initiative: PlayerSide;
  /** Which player is currently taking their turn. */
  playerTurn: PlayerSide | null;
  /** The ranged attacks that are still due to be resolved this phase. */
  remainingRangedAttacks: Set<UnitInstance>;
  /** The commands that are still due to be resolved this phase. */
  remainingCommands: Set<Command>;
  /** The units that are still eligible to be moved this phase. */
  remainingMovements: Set<UnitInstance>;
  /** The engagements that are still due to be resolved this phase. */
  remainingEngagements: Set<EngagedUnitPresence>;
  /** The state of the board. */
  boardState: Board;
  /** The state of both players' cards. */
  cardState: CardState;
}

/** Helper function to assert that a value matches the schema. */
const _assertExactGameState: AssertExact<GameState, GameStateSchemaType> = true;
