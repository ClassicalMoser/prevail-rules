import type { AssertExact } from '@utils';
import type { SpectatorCardState } from '@game/cardState';
import type { GameStateBase } from './gameStateBase';

import { z } from 'zod';
import { spectatorCardStateSchema } from '@game/cardState';
import { gameStateBaseSchema } from './gameStateBase';

/**
 * The game state as a spectator: both hands hidden.
 * The `visibility` tag names the view, and the card state is the one that
 * view may read, so the two cannot disagree.
 */
export interface SpectatorGameState extends GameStateBase {
  /** The view this state is. */
  visibility: 'spectator';
  /** The cards this view may read. */
  cardState: SpectatorCardState;
}

const _spectatorGameStateSchemaObject = gameStateBaseSchema
  .extend({
    cardState: spectatorCardStateSchema,
    visibility: z.literal('spectator'),
  })
  .strict();

type SpectatorGameStateSchemaType = z.infer<
  typeof _spectatorGameStateSchemaObject
>;

/** Schema for {@link SpectatorGameState}. */
export const spectatorGameStateSchema: z.ZodType<SpectatorGameState> =
  _spectatorGameStateSchemaObject;

const _assertSpectatorGameState: AssertExact<
  SpectatorGameState,
  SpectatorGameStateSchemaType
> = true;
