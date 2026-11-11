import type { AssertExact } from '@utils';
import type { BlackSeenCardState } from '@game/cardState';
import type { GameStateBase } from './gameStateBase';

import type {
  boardSchema,
  playerSideSchema,
  unitInstanceSchema,
} from '@entities';
import type { SeenRoundState } from '@game/roundState';

import { z } from 'zod';
import { seenRoundStateSchema } from '@game/roundState';
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
  /** The round, with the event log this view may read. */
  currentRoundState: SeenRoundState;
  /** The cards this view may read. */
  cardState: BlackSeenCardState;
}

const _blackSeenGameStateSchemaObject: z.ZodObject<{
  boardState: typeof boardSchema;
  currentInitiative: typeof playerSideSchema;
  currentRoundNumber: z.ZodInt;
  currentRoundState: typeof seenRoundStateSchema;
  lostCommanders: z.ZodArray<typeof playerSideSchema>;
  reservedUnits: z.ZodArray<typeof unitInstanceSchema>;
  routedUnits: z.ZodArray<typeof unitInstanceSchema>;
  winner: z.ZodOptional<typeof playerSideSchema>;
  cardState: typeof blackSeenCardStateSchema;
  visibility: z.ZodLiteral<'blackSeen'>;
}> = gameStateBaseSchema.merge(
  z
    .object({
      currentRoundState: seenRoundStateSchema,
      cardState: blackSeenCardStateSchema,
      visibility: z.literal('blackSeen'),
    })
    .strict(),
);

type BlackSeenGameStateSchemaType = z.infer<
  typeof _blackSeenGameStateSchemaObject
>;

/** Schema for {@link BlackSeenGameState}. */
export const blackSeenGameStateSchema: typeof _blackSeenGameStateSchemaObject =
  _blackSeenGameStateSchemaObject;

const _assertBlackSeenGameState: AssertExact<
  BlackSeenGameState,
  BlackSeenGameStateSchemaType
> = true;
