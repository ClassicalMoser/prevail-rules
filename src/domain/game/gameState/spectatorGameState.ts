import type { AssertExact } from '@utils';
import type { SpectatorCardState } from '@game/cardState';
import type { GameStateBase } from './gameStateBase';

import type {
  boardSchema,
  playerSideSchema,
  unitInstanceSchema,
} from '@entities';
import type { roundStateSchema } from '@game/roundState';

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

const _spectatorGameStateSchemaObject: z.ZodObject<{
  boardState: typeof boardSchema;
  currentInitiative: typeof playerSideSchema;
  currentRoundNumber: z.ZodInt;
  currentRoundState: typeof roundStateSchema;
  lostCommanders: z.ZodArray<typeof playerSideSchema>;
  reservedUnits: z.ZodArray<typeof unitInstanceSchema>;
  routedUnits: z.ZodArray<typeof unitInstanceSchema>;
  winner: z.ZodOptional<typeof playerSideSchema>;
  cardState: typeof spectatorCardStateSchema;
  visibility: z.ZodLiteral<'spectator'>;
}> = gameStateBaseSchema.merge(
  z
    .object({
      cardState: spectatorCardStateSchema,
      visibility: z.literal('spectator'),
    })
    .strict(),
);

type SpectatorGameStateSchemaType = z.infer<
  typeof _spectatorGameStateSchemaObject
>;

/** Schema for {@link SpectatorGameState}. */
export const spectatorGameStateSchema: typeof _spectatorGameStateSchemaObject =
  _spectatorGameStateSchemaObject;

const _assertSpectatorGameState: AssertExact<
  SpectatorGameState,
  SpectatorGameStateSchemaType
> = true;
