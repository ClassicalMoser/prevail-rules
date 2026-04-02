import type {
  CardState,
  PlayerSide,
  SmallBoard,
  UnitInstance,
} from '@entities';
import type { AssertExact } from '@utils';
import type { RoundState } from './roundState';

import {
  cardStateSchema,
  playerSideSchema,
  smallBoardSchema,
  unitInstanceSchema,
} from '@entities';
import { z } from 'zod';
import { roundStateSchema } from './roundState';

/**
 * Game state on a **small** board.
 * Every field is documented here so IDE hover does not depend on {@link GameStateBase}.
 */
export interface SmallGameState {
  /**
   * Root discriminator for {@link GameState}; must match `boardState.boardType` (`'small'`).
   * One literal for TS narrowing and Zod — no extra type parameters.
   */
  boardType: 'small';
  /** The current round number of the game. */
  currentRoundNumber: number;
  /** The state of the current round of the game. */
  currentRoundState: RoundState;
  /** Which player currently has initiative. */
  currentInitiative: PlayerSide;
  /** The state of both players' cards. */
  cardState: CardState;
  /** Units not yet placed on the board. */
  reservedUnits: Set<UnitInstance>;
  /** The units that have been routed during the game. */
  routedUnits: Set<UnitInstance>;
  /** The commanders that have been lost during the game. */
  lostCommanders: Set<PlayerSide>;
  /** Board and piece layout for the small size. */
  boardState: SmallBoard;
}

// ---------------------------------------------------------------------------
// Zod
// ---------------------------------------------------------------------------

const _smallGameStateSchemaObject = z.object({
  boardType: z.literal('small' satisfies SmallBoard['boardType']),
  currentRoundNumber: z.int().min(0),
  currentRoundState: roundStateSchema,
  currentInitiative: playerSideSchema,
  cardState: cardStateSchema,
  reservedUnits: z.set(unitInstanceSchema),
  routedUnits: z.set(unitInstanceSchema),
  lostCommanders: z.set(playerSideSchema),
  boardState: smallBoardSchema,
});

type SmallGameStateSchemaType = z.infer<typeof _smallGameStateSchemaObject>;

const _assertExactSmallGameState: AssertExact<
  SmallGameState,
  SmallGameStateSchemaType
> = true;

/** {@link SmallGameState} */
export const gameStateSchemaForSmallBoard: z.ZodType<SmallGameState> =
  _smallGameStateSchemaObject;
