import type { Army } from '@entities';
import type { AssertExact } from '@utils';
import type { SmallGameState } from './smallGameState';

import { armySchema } from '@entities';
import { z } from 'zod';
import { gameStateSchemaForSmallBoard } from './smallGameState';

/**
 * A **tutorial** game (`gameType === 'tutorial'`).
 * Every field is documented here so IDE hover does not jump through a shared base interface.
 */
export interface TutorialGame {
  gameType: 'tutorial';
  gameState: SmallGameState;
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

const _tutorialGameSchemaObject: z.ZodType<TutorialGame> = z.object({
  gameType: z.literal('tutorial'),
  gameState: gameStateSchemaForSmallBoard,
  id: z.uuid(),
  blackPlayer: z.uuid(),
  whitePlayer: z.uuid(),
  blackArmy: armySchema,
  whiteArmy: armySchema,
}) as z.ZodType<TutorialGame>;

type TutorialGameSchemaType = z.infer<typeof _tutorialGameSchemaObject>;

const _assertExactTutorialGame: AssertExact<
  TutorialGame,
  TutorialGameSchemaType
> = true;

/** Validates a {@link Game} when `gameType` is known to be `tutorial`. */
export const tutorialGameSchema: z.ZodType<TutorialGame> =
  _tutorialGameSchemaObject;
