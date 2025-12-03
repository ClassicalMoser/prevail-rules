import type {
  Board,
  BoardSchemaType,
  CardState,
  Command,
  EngagedUnitPresence,
  Phase,
  PlayerSide,
  UnitInstance,
} from '@entities';
import type { AssertExact } from '@utils';
import { z } from 'zod';
import { boardSchema } from './board';
import { cardStateSchema } from './card/cardState';
import { commandSchema } from './card/command';
import { playerSideSchema } from './player/playerSide';
import { phaseSchema } from './sequence/phases';
import { unitInstanceSchema } from './unit/unitInstance';
import { engagedUnitPresenceSchema } from './unitPresence/engagedUnitPresence';

/** The schema for a game state. */
export const gameStateSchema: z.ZodType<GameState> = z.object({
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
  'boardState'
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
