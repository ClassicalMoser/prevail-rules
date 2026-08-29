import type { AssertExact } from '@utils';
import type { GameStateForVisibility } from './gameStateForVisibility';

import { boardSchema, playerSideSchema, unitInstanceSchema } from '@entities';
import { z } from 'zod';
import { blackSeenCardStateSchema } from '@game/cardState';
import { roundStateSchema } from '@game/roundState';

const _blackSeenGameStateSchemaObject = z
  .object({
    boardState: boardSchema,
    cardState: blackSeenCardStateSchema,
    currentInitiative: playerSideSchema,
    currentRoundNumber: z.int().min(0),
    currentRoundState: roundStateSchema,
    lostCommanders: z.array(playerSideSchema),
    reservedUnits: z.array(unitInstanceSchema),
    routedUnits: z.array(unitInstanceSchema),
    winner: playerSideSchema.nullable().optional(),
  })
  .strict();

type BlackSeenGameStateSchemaType = z.infer<
  typeof _blackSeenGameStateSchemaObject
>;

/** Schema for black-seen {@link GameStateForVisibility}. */
export const blackSeenGameStateSchema: z.ZodType<
  GameStateForVisibility<'blackSeen'>
> = _blackSeenGameStateSchemaObject;

const _assertExactBlackSeenGameState: AssertExact<
  GameStateForVisibility<'blackSeen'>,
  BlackSeenGameStateSchemaType
> = true;
