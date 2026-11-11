import type { AssertExact } from '@utils';
import type { BlackSeenCardState } from '@game/cardState';
import type { GameStateBase } from './gameStateBase';

import { z } from 'zod';
import { blackSeenCardStateSchema } from '@game/cardState';
import { gameStateBaseSchema } from './gameStateBase';

/**
 * The game state as black's seat: black's own cards in view, white's hidden.
 * The `visibility` tag names the view, and the card state is the one that
 * view may read, so the two cannot disagree.
 */
export interface BlackSeenGameState extends GameStateBase {
  /** The view this state is. */
  visibility: 'blackSeen';
  /** The cards this view may read. */
  cardState: BlackSeenCardState;
}

const _blackSeenGameStateSchemaObject = gameStateBaseSchema
  .extend({
    cardState: blackSeenCardStateSchema,
    visibility: z.literal('blackSeen'),
  })
  .strict();

type BlackSeenGameStateSchemaType = z.infer<
  typeof _blackSeenGameStateSchemaObject
>;

/** Schema for {@link BlackSeenGameState}. */
export const blackSeenGameStateSchema: z.ZodType<BlackSeenGameState> =
  _blackSeenGameStateSchemaObject;

const _assertBlackSeenGameState: AssertExact<
  BlackSeenGameState,
  BlackSeenGameStateSchemaType
> = true;
