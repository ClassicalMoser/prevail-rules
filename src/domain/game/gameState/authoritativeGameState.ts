import type { AssertExact } from '@utils';
import type { AuthoritativeCardState } from '@game/cardState';
import type { GameStateBase } from './gameStateBase';

import { z } from 'zod';
import { authoritativeCardStateSchema } from '@game/cardState';
import { gameStateBaseSchema } from './gameStateBase';

/**
 * The game state as the full record: both hands in view.
 * The `visibility` tag names the view, and the card state is the one that
 * view may read, so the two cannot disagree.
 */
export interface AuthoritativeGameState extends GameStateBase {
  /** The view this state is. */
  visibility: 'authoritative';
  /** The cards this view may read. */
  cardState: AuthoritativeCardState;
}

const _authoritativeGameStateSchemaObject = gameStateBaseSchema
  .extend({
    cardState: authoritativeCardStateSchema,
    visibility: z.literal('authoritative'),
  })
  .strict();

type AuthoritativeGameStateSchemaType = z.infer<
  typeof _authoritativeGameStateSchemaObject
>;

/** Schema for {@link AuthoritativeGameState}. */
export const authoritativeGameStateSchema: z.ZodType<AuthoritativeGameState> =
  _authoritativeGameStateSchemaObject;

const _assertAuthoritativeGameState: AssertExact<
  AuthoritativeGameState,
  AuthoritativeGameStateSchemaType
> = true;
