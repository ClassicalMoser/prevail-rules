import type { AssertExact } from '@utils';
import type { AuthoritativeCardState } from '@game/cardState';
import type { GameStateBase } from './gameStateBase';

import type {
  boardSchema,
  playerSideSchema,
  unitInstanceSchema,
} from '@entities';
import type { AuthoritativeRoundState } from '@game/roundState';

import { z } from 'zod';
import { authoritativeRoundStateSchema } from '@game/roundState';
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
  /** The round, with the event log this view may read. */
  currentRoundState: AuthoritativeRoundState;
  /** The cards this view may read. */
  cardState: AuthoritativeCardState;
}

const _authoritativeGameStateSchemaObject: z.ZodObject<{
  boardState: typeof boardSchema;
  currentInitiative: typeof playerSideSchema;
  currentRoundState: typeof authoritativeRoundStateSchema;
  lostCommanders: z.ZodArray<typeof playerSideSchema>;
  reservedUnits: z.ZodArray<typeof unitInstanceSchema>;
  routedUnits: z.ZodArray<typeof unitInstanceSchema>;
  winner: z.ZodOptional<typeof playerSideSchema>;
  cardState: typeof authoritativeCardStateSchema;
  visibility: z.ZodLiteral<'authoritative'>;
}> = gameStateBaseSchema.merge(
  z
    .object({
      currentRoundState: authoritativeRoundStateSchema,
      cardState: authoritativeCardStateSchema,
      visibility: z.literal('authoritative'),
    })
    .strict(),
);

type AuthoritativeGameStateSchemaType = z.infer<
  typeof _authoritativeGameStateSchemaObject
>;

/** Schema for {@link AuthoritativeGameState}. */
export const authoritativeGameStateSchema: typeof _authoritativeGameStateSchemaObject =
  _authoritativeGameStateSchemaObject;

const _assertAuthoritativeGameState: AssertExact<
  AuthoritativeGameState,
  AuthoritativeGameStateSchemaType
> = true;
