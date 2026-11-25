import type { AssertExact } from '@utils';
import type { BlackSeenCardState } from '@game/cardState';

import type { Board, PlayerSide, UnitInstance } from '@entities';
import { boardSchema, playerSideSchema, unitInstanceSchema } from '@entities';
import type { RoundState } from '@game/roundState';
import type { GameStateIndex } from './gameStateIndex';

import { z } from 'zod';
import { roundStateSchema } from '@game/roundState';
import { gameStateIndexSchema } from './gameStateIndex';
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
   * Where every unit and commander is, by name: kept by every write to the
   * board and the lists above, and checked against them when a state is read.
   */
  index: GameStateIndex;
  /**
   * Set by `gameOver` apply; `'pending'` while the game is ongoing. Every
   * ending names a winner — there is no draw in this game (§11.3).
   */
  winner: PlayerSide | 'pending';
  /** The round in progress. */
  currentRoundState: RoundState;
  /** The cards this view may read. */
  cardState: BlackSeenCardState;
}

const _blackSeenGameStateSchemaObject: z.ZodObject<{
  boardState: typeof boardSchema;
  currentInitiative: typeof playerSideSchema;
  currentRoundState: typeof roundStateSchema;
  index: typeof gameStateIndexSchema;
  lostCommanders: z.ZodArray<typeof playerSideSchema>;
  reservedUnits: z.ZodArray<typeof unitInstanceSchema>;
  routedUnits: z.ZodArray<typeof unitInstanceSchema>;
  winner: z.ZodUnion<
    readonly [typeof playerSideSchema, z.ZodLiteral<'pending'>]
  >;
  cardState: typeof blackSeenCardStateSchema;
  visibility: z.ZodLiteral<'blackSeen'>;
}> = z
  .object({
    boardState: boardSchema,
    cardState: blackSeenCardStateSchema,
    currentInitiative: playerSideSchema,
    currentRoundState: roundStateSchema,
    index: gameStateIndexSchema,
    lostCommanders: z.array(playerSideSchema),
    reservedUnits: z.array(unitInstanceSchema),
    routedUnits: z.array(unitInstanceSchema),
    visibility: z.literal('blackSeen'),
    winner: z.union([playerSideSchema, z.literal('pending')]),
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
