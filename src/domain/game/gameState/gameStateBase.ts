import type { Board, PlayerSide, UnitInstance } from '@entities';
import type { RoundState } from '@game/roundState';

import { boardSchema, playerSideSchema, unitInstanceSchema } from '@entities';
import { z } from 'zod';
import { roundStateSchema } from '@game/roundState';

/**
 * What every view of a game's state holds, whoever is looking: the board, the
 * round, who has initiative, and what has been lost. A view adds its
 * `visibility` and the cards that visibility may read.
 *
 * Board size lives only on {@link Board.boardType} (`boardState.boardType`).
 */
export interface GameStateBase {
  /** The current round number of the game. */
  currentRoundNumber: number;
  /** The state of the current round of the game. */
  currentRoundState: RoundState;
  /** Which player currently has initiative. */
  currentInitiative: PlayerSide;
  /** Units not yet placed on the board. */
  reservedUnits: UnitInstance[];
  /** The units that have been routed during the game. */
  routedUnits: UnitInstance[];
  /** The commanders that have been lost during the game. */
  lostCommanders: PlayerSide[];
  /** Board and piece layout. */
  boardState: Board;
  /**
   * Set by `gameOver` apply. Absent while the game is ongoing. Every
   * ending names a winner — there is no draw in this game (§11.3).
   */
  winner?: PlayerSide;
}

/**
 * The schema of {@link GameStateBase}, which each view extends with its own
 * `visibility` and card state.
 */
export const gameStateBaseSchema: z.ZodObject<{
  boardState: typeof boardSchema;
  currentInitiative: typeof playerSideSchema;
  currentRoundNumber: z.ZodInt;
  currentRoundState: typeof roundStateSchema;
  lostCommanders: z.ZodArray<typeof playerSideSchema>;
  reservedUnits: z.ZodArray<typeof unitInstanceSchema>;
  routedUnits: z.ZodArray<typeof unitInstanceSchema>;
  winner: z.ZodOptional<typeof playerSideSchema>;
}> = z.object({
  boardState: boardSchema,
  currentInitiative: playerSideSchema,
  currentRoundNumber: z.int().min(0),
  currentRoundState: roundStateSchema,
  lostCommanders: z.array(playerSideSchema),
  reservedUnits: z.array(unitInstanceSchema),
  routedUnits: z.array(unitInstanceSchema),
  winner: playerSideSchema.optional(),
});
