import type { Board, BoardSchemaType } from "@entities/board/board.js";
import type { CardState } from "@entities/card/cardState.js";
import type { Command } from "@entities/card/command.js";
import type { PlayerSide } from "@entities/player/playerSide.js";
import type { Phase } from "@entities/sequence/phases.js";

import type { UnitInstance } from "@entities/unit/unitInstance.js";
import type { EngagedUnitPresence } from "@entities/unitPresence/engagedUnitPresence.js";
import type { AssertExact } from "@utils/assertExact.js";
import { boardSchema } from "@entities/board/board.js";
import { cardStateSchema } from "@entities/card/cardState.js";
import { commandSchema } from "@entities/card/command.js";
import { playerSideSchema } from "@entities/player/playerSide.js";
import { phaseSchema } from "@entities/sequence/phases.js";
import { unitInstanceSchema } from "@entities/unit/unitInstance.js";
import { engagedUnitPresenceSchema } from "@entities/unitPresence/engagedUnitPresence.js";
import { z } from "zod";

/** The schema for a game state. */
export const gameStateSchema = z.object({
  /** The current round number of the game. */
  currentRound: z.number().int().min(0),
  /** The current phase of the game. */
  currentPhase: phaseSchema,
  /** Which player currently has initiative. */
  initiative: playerSideSchema,
  /** Which player is currently taking their turn. */
  playerTurn: playerSideSchema.optional(),
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
  playerTurn?: PlayerSide;
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
