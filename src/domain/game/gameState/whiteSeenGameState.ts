import type { AssertExact } from '@utils';
import type { WhiteSeenCardState } from '@game/cardState';
import type { GameStateBase } from './gameStateBase';

import { z } from 'zod';
import { whiteSeenCardStateSchema } from '@game/cardState';
import { gameStateBaseSchema } from './gameStateBase';

/**
 * The game state as white's seat: white's own cards in view, black's hidden.
 * The `visibility` tag names the view, and the card state is the one that
 * view may read, so the two cannot disagree.
 */
export interface WhiteSeenGameState extends GameStateBase {
  /** The view this state is. */
  visibility: 'whiteSeen';
  /** The cards this view may read. */
  cardState: WhiteSeenCardState;
}

const _whiteSeenGameStateSchemaObject = gameStateBaseSchema
  .extend({
    cardState: whiteSeenCardStateSchema,
    visibility: z.literal('whiteSeen'),
  })
  .strict();

type WhiteSeenGameStateSchemaType = z.infer<
  typeof _whiteSeenGameStateSchemaObject
>;

/** Schema for {@link WhiteSeenGameState}. */
export const whiteSeenGameStateSchema: z.ZodType<WhiteSeenGameState> =
  _whiteSeenGameStateSchemaObject;

const _assertWhiteSeenGameState: AssertExact<
  WhiteSeenGameState,
  WhiteSeenGameStateSchemaType
> = true;
