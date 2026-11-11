import type { AssertExact } from '@utils';
import type { WhiteSeenCardState } from '@game/cardState';
import type { GameStateBase } from './gameStateBase';

import type {
  boardSchema,
  playerSideSchema,
  unitInstanceSchema,
} from '@entities';
import type { SeenRoundState } from '@game/roundState';

import { z } from 'zod';
import { seenRoundStateSchema } from '@game/roundState';
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
  /** The round, with the event log this view may read. */
  currentRoundState: SeenRoundState;
  /** The cards this view may read. */
  cardState: WhiteSeenCardState;
}

const _whiteSeenGameStateSchemaObject: z.ZodObject<{
  boardState: typeof boardSchema;
  currentInitiative: typeof playerSideSchema;
  currentRoundNumber: z.ZodInt;
  currentRoundState: typeof seenRoundStateSchema;
  lostCommanders: z.ZodArray<typeof playerSideSchema>;
  reservedUnits: z.ZodArray<typeof unitInstanceSchema>;
  routedUnits: z.ZodArray<typeof unitInstanceSchema>;
  winner: z.ZodOptional<typeof playerSideSchema>;
  cardState: typeof whiteSeenCardStateSchema;
  visibility: z.ZodLiteral<'whiteSeen'>;
}> = gameStateBaseSchema.merge(
  z
    .object({
      currentRoundState: seenRoundStateSchema,
      cardState: whiteSeenCardStateSchema,
      visibility: z.literal('whiteSeen'),
    })
    .strict(),
);

type WhiteSeenGameStateSchemaType = z.infer<
  typeof _whiteSeenGameStateSchemaObject
>;

/** Schema for {@link WhiteSeenGameState}. */
export const whiteSeenGameStateSchema: typeof _whiteSeenGameStateSchemaObject =
  _whiteSeenGameStateSchemaObject;

const _assertWhiteSeenGameState: AssertExact<
  WhiteSeenGameState,
  WhiteSeenGameStateSchemaType
> = true;
