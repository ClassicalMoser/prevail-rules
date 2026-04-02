import type {
  CardState,
  LargeBoard,
  PlayerSide,
  UnitInstance,
} from '@entities';
import type { AssertExact } from '@utils';
import type { RoundState } from './roundState';

import {
  cardStateSchema,
  largeBoardSchema,
  playerSideSchema,
  unitInstanceSchema,
} from '@entities';
import { z } from 'zod';
import { roundStateSchema } from './roundState';

/**
 * Game state on a **large** board.
 * Every field is documented here so IDE hover does not depend on {@link GameStateBase}.
 */
export interface LargeGameState {
  /**
   * Root discriminator for {@link GameState}; must match `boardState.boardType` (`'large'`).
   * One literal for TS narrowing and Zod — no extra type parameters.
   */
  boardType: 'large';
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
  /** Board and piece layout for the large size. */
  boardState: LargeBoard;
}

// ---------------------------------------------------------------------------
// Zod
// ---------------------------------------------------------------------------

const _largeGameStateSchemaObject = z.object({
  boardType: z.literal('large' satisfies LargeBoard['boardType']),
  currentRoundNumber: z.int().min(0),
  currentRoundState: roundStateSchema,
  currentInitiative: playerSideSchema,
  cardState: cardStateSchema,
  reservedUnits: z.set(unitInstanceSchema),
  routedUnits: z.set(unitInstanceSchema),
  lostCommanders: z.set(playerSideSchema),
  boardState: largeBoardSchema,
});

type LargeGameStateSchemaType = z.infer<typeof _largeGameStateSchemaObject>;

const _assertExactLargeGameState: AssertExact<
  LargeGameState,
  LargeGameStateSchemaType
> = true;

/** {@link LargeGameState} */
export const gameStateSchemaForLargeBoard: z.ZodType<LargeGameState> =
  _largeGameStateSchemaObject;
