import type { AssertExact } from '@utils';
import type { BlackSeenCardState } from '@game/cardState';

import type { Board, PlayerSide, UnitInstance } from '@entities';
import { boardSchema, playerSideSchema, unitInstanceSchema } from '@entities';
import type { SeenRoundState } from '@game/roundState';

import { z } from 'zod';
import { seenRoundStateSchema } from '@game/roundState';
import { blackSeenCardStateSchema } from '@game/cardState';

/**
 * The game state as black's seat: black's own cards in view, white's hidden.
 * The `visibility` tag names the view, and the card state is the one that
 * view may read, so the two cannot disagree.
 */
export interface BlackSeenGameState {
  /** The view this state is. */
  visibility: 'blackSeen';
  /** Which player currently has initiative. */
  currentInitiative: PlayerSide;
  /** Units not yet placed on the board. */
  reservedUnits: UnitInstance[];
  /** The units that have been routed during the game. */
  routedUnits: UnitInstance[];
  /** The commanders that have been lost during the game. */
  lostCommanders: PlayerSide[];
  /** Board and piece layout. */
  boardState: Board;
  /**
   * Set by `gameOver` apply. Absent while the game is ongoing. Every
   * ending names a winner — there is no draw in this game (§11.3).
   */
  winner?: PlayerSide;
  /** The round, with the event log this view may read. */
  currentRoundState: SeenRoundState;
  /** The cards this view may read. */
  cardState: BlackSeenCardState;
}

const _blackSeenGameStateSchemaObject: z.ZodObject<{
  boardState: typeof boardSchema;
  currentInitiative: typeof playerSideSchema;
  currentRoundState: typeof seenRoundStateSchema;
  lostCommanders: z.ZodArray<typeof playerSideSchema>;
  reservedUnits: z.ZodArray<typeof unitInstanceSchema>;
  routedUnits: z.ZodArray<typeof unitInstanceSchema>;
  winner: z.ZodOptional<typeof playerSideSchema>;
  cardState: typeof blackSeenCardStateSchema;
  visibility: z.ZodLiteral<'blackSeen'>;
}> = z
  .object({
    boardState: boardSchema,
    cardState: blackSeenCardStateSchema,
    currentInitiative: playerSideSchema,
    currentRoundState: seenRoundStateSchema,
    lostCommanders: z.array(playerSideSchema),
    reservedUnits: z.array(unitInstanceSchema),
    routedUnits: z.array(unitInstanceSchema),
    visibility: z.literal('blackSeen'),
    winner: playerSideSchema.optional(),
  })
  .strict();

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
