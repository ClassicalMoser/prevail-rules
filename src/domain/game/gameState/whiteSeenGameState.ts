import type { AssertExact } from '@utils';
import type { WhiteSeenCardState } from '@game/cardState';

import type { Board, PlayerSide, UnitInstance } from '@entities';
import { boardSchema, playerSideSchema, unitInstanceSchema } from '@entities';
import type { SeenRoundState } from '@game/roundState';

import { z } from 'zod';
import { seenRoundStateSchema } from '@game/roundState';
import { whiteSeenCardStateSchema } from '@game/cardState';

/**
 * The game state as white's seat: white's own cards in view, black's hidden.
 * The `visibility` tag names the view, and the card state is the one that
 * view may read, so the two cannot disagree.
 */
export interface WhiteSeenGameState {
  /** The view this state is. */
  visibility: 'whiteSeen';
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
  cardState: WhiteSeenCardState;
}

const _whiteSeenGameStateSchemaObject: z.ZodObject<{
  boardState: typeof boardSchema;
  currentInitiative: typeof playerSideSchema;
  currentRoundState: typeof seenRoundStateSchema;
  lostCommanders: z.ZodArray<typeof playerSideSchema>;
  reservedUnits: z.ZodArray<typeof unitInstanceSchema>;
  routedUnits: z.ZodArray<typeof unitInstanceSchema>;
  winner: z.ZodOptional<typeof playerSideSchema>;
  cardState: typeof whiteSeenCardStateSchema;
  visibility: z.ZodLiteral<'whiteSeen'>;
}> = z
  .object({
    boardState: boardSchema,
    cardState: whiteSeenCardStateSchema,
    currentInitiative: playerSideSchema,
    currentRoundState: seenRoundStateSchema,
    lostCommanders: z.array(playerSideSchema),
    reservedUnits: z.array(unitInstanceSchema),
    routedUnits: z.array(unitInstanceSchema),
    visibility: z.literal('whiteSeen'),
    winner: playerSideSchema.optional(),
  })
  .strict();

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
