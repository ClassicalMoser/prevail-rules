import type {
  Board,
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
  /** The commands that are still due to be resolved this phase. */
  remainingCommands: Set<Command>;
  /** Units that have moved this round. */
  unitsThatMoved: Set<UnitInstance>;
  /** Units that have made ranged attacks this round. */
  unitsThatMadeRangedAttacks: Set<UnitInstance>;
  /** The ranged attacks that are still due to be resolved this phase. */
  remainingRangedAttacks: Set<UnitInstance>;
  /** The units that are still eligible to be moved this phase. */
  remainingMovements: Set<UnitInstance>;
  /** The engagements that are still due to be resolved this phase. */
  remainingEngagements: Set<EngagedUnitPresence>;
  /** The state of the board. */
  boardState: Board;
  /** The state of both players' cards. */
  cardState: CardState;
  /** The units that have been defeated during the game. */
  defeatedUnits: Set<UnitInstance>;
}

const _gameStateSchemaObject = z.object({
  /** The current round number of the game. */
  currentRound: z.number().int().min(0),
  /** The current phase of the game. */
  currentPhase: phaseSchema,
  /** Which player currently has initiative. */
  initiative: playerSideSchema,
  /** Which player is currently taking their turn. */
  playerTurn: playerSideSchema.optional(),
  /** The commands that are still due to be resolved this phase. */
  remainingCommands: z.set(commandSchema),
  /** Units that have moved this round. */
  unitsThatMoved: z.set(unitInstanceSchema),
  /** Units that have made ranged attacks this round. */
  unitsThatMadeRangedAttacks: z.set(unitInstanceSchema),
  /** The units that are still eligible to be moved this phase. */
  remainingMovements: z.set(unitInstanceSchema),
  /** The ranged attacks that are still due to be resolved this phase. */
  remainingRangedAttacks: z.set(unitInstanceSchema),
  /** The engagements that are still due to be resolved this phase. */
  remainingEngagements: z.set(engagedUnitPresenceSchema),
  /** The state of the board. */
  boardState: boardSchema,
  /** The state of both players' cards. */
  cardState: cardStateSchema,
  /** The units that have been defeated during the game. */
  defeatedUnits: z.set(unitInstanceSchema),
});

type GameStateSchemaType = z.infer<typeof _gameStateSchemaObject>;

/** The schema for a game state. */
export const gameStateSchema: z.ZodType<GameState> = _gameStateSchemaObject;

// Verify manual type matches schema inference
const _assertExactGameState: AssertExact<GameState, GameStateSchemaType> = true;
