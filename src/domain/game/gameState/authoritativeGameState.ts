import type { AssertExact } from '@utils';
import type { AuthoritativeCardState } from '@game/cardState';

import type { Board, PlayerSide, UnitInstance } from '@entities';
import { boardSchema, playerSideSchema, unitInstanceSchema } from '@entities';
import type { RoundState } from '@game/roundState';
import type { GameStateIndex } from './gameStateIndex';

import { z } from 'zod';
import { roundStateSchema } from '@game/roundState';
import { gameStateIndexSchema } from './gameStateIndex';
import { authoritativeCardStateSchema } from '@game/cardState';

/**
 * The game state as the full record: both hands in view.
 * The `visibility` tag names the view, and the card state is the one that
 * view may read, so the two cannot disagree.
 */
export interface AuthoritativeGameState {
  /** The view this state is. */
  visibility: 'authoritative';
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
   * Set by `gameOver` apply. Absent while the game is ongoing. Every
   * ending names a winner — there is no draw in this game (§11.3).
   */
  winner?: PlayerSide;
  /** The round in progress. */
  currentRoundState: RoundState;
  /** The cards this view may read. */
  cardState: AuthoritativeCardState;
}

const _authoritativeGameStateSchemaObject: z.ZodObject<{
  boardState: typeof boardSchema;
  currentInitiative: typeof playerSideSchema;
  currentRoundState: typeof roundStateSchema;
  index: typeof gameStateIndexSchema;
  lostCommanders: z.ZodArray<typeof playerSideSchema>;
  reservedUnits: z.ZodArray<typeof unitInstanceSchema>;
  routedUnits: z.ZodArray<typeof unitInstanceSchema>;
  winner: z.ZodOptional<typeof playerSideSchema>;
  cardState: typeof authoritativeCardStateSchema;
  visibility: z.ZodLiteral<'authoritative'>;
}> = z
  .object({
    boardState: boardSchema,
    cardState: authoritativeCardStateSchema,
    currentInitiative: playerSideSchema,
    currentRoundState: roundStateSchema,
    index: gameStateIndexSchema,
    lostCommanders: z.array(playerSideSchema),
    reservedUnits: z.array(unitInstanceSchema),
    routedUnits: z.array(unitInstanceSchema),
    visibility: z.literal('authoritative'),
    winner: playerSideSchema.optional(),
  })
  .strict();

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
