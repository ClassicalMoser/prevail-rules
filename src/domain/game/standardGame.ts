import type { Army } from '@entities';
import type { AssertExact } from '@utils';
import type { StandardGameState } from './standardGameState';

import { armySchema } from '@entities';
import { z } from 'zod';
import { gameStateSchemaForStandardBoard } from './standardGameState';

/**
 * A **standard** game (`gameType === 'standard'`).
 * Every field is documented here so IDE hover does not jump through a shared base interface.
 */
export interface StandardGame {
  gameType: 'standard';
  gameState: StandardGameState;
  /** The unique identifier of the game. */
  id: string;
  /** The unique identifier of the player on the black side of the game. */
  blackPlayer: string;
  /** The unique identifier of the player on the white side of the game. */
  whitePlayer: string;
  /** The army brought by the black player. */
  blackArmy: Army;
  /** The army brought by the white player. */
  whiteArmy: Army;
}

// ---------------------------------------------------------------------------
// Zod
// ---------------------------------------------------------------------------

const _standardGameSchemaObject: z.ZodType<StandardGame> = z.object({
  gameType: z.literal('standard'),
  gameState: gameStateSchemaForStandardBoard,
  id: z.uuid(),
  blackPlayer: z.uuid(),
  whitePlayer: z.uuid(),
  blackArmy: armySchema,
  whiteArmy: armySchema,
}) as z.ZodType<StandardGame>;

type StandardGameSchemaType = z.infer<typeof _standardGameSchemaObject>;

const _assertExactStandardGame: AssertExact<
  StandardGame,
  StandardGameSchemaType
> = true;

/** Validates a {@link Game} when `gameType` is known to be `standard`. */
export const standardGameSchema: z.ZodType<StandardGame> =
  _standardGameSchemaObject;
