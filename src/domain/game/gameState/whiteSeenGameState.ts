import type { AssertExact } from '@utils';
import type { GameStateForVisibility } from './gameStateForVisibility';

import { boardSchema, playerSideSchema, unitInstanceSchema } from '@entities';
import { z } from 'zod';
import { whiteSeenCardStateSchema } from '@game/cardState';
import { roundStateSchema } from '@game/roundState';

const _whiteSeenGameStateSchemaObject = z
  .object({
    boardState: boardSchema,
    cardState: whiteSeenCardStateSchema,
    currentInitiative: playerSideSchema,
    currentRoundNumber: z.int().min(0),
    currentRoundState: roundStateSchema,
    lostCommanders: z.array(playerSideSchema),
    reservedUnits: z.array(unitInstanceSchema),
    routedUnits: z.array(unitInstanceSchema),
    winner: playerSideSchema.nullable().optional(),
  })
  .strict();

type WhiteSeenGameStateSchemaType = z.infer<
  typeof _whiteSeenGameStateSchemaObject
>;

/** Schema for white-seen {@link GameStateForVisibility}. */
export const whiteSeenGameStateSchema: z.ZodType<
  GameStateForVisibility<'whiteSeen'>
> = _whiteSeenGameStateSchemaObject;

const _assertExactWhiteSeenGameState: AssertExact<
  GameStateForVisibility<'whiteSeen'>,
  WhiteSeenGameStateSchemaType
> = true;
