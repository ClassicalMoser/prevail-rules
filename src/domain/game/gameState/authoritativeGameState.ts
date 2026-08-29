import type { AssertExact } from '@utils';
import type { GameStateForVisibility } from './gameStateForVisibility';

import { boardSchema, playerSideSchema, unitInstanceSchema } from '@entities';
import { z } from 'zod';
import { authoritativeCardStateSchema } from '@game/cardState';
import { roundStateSchema } from '@game/roundState';

const _authoritativeGameStateSchemaObject = z
  .object({
    boardState: boardSchema,
    cardState: authoritativeCardStateSchema,
    currentInitiative: playerSideSchema,
    currentRoundNumber: z.int().min(0),
    currentRoundState: roundStateSchema,
    lostCommanders: z.array(playerSideSchema),
    reservedUnits: z.array(unitInstanceSchema),
    routedUnits: z.array(unitInstanceSchema),
    winner: playerSideSchema.nullable().optional(),
  })
  .strict();

type AuthoritativeGameStateSchemaType = z.infer<
  typeof _authoritativeGameStateSchemaObject
>;

/** Schema for authoritative {@link GameStateForVisibility}. */
export const authoritativeGameStateSchema: z.ZodType<
  GameStateForVisibility<'authoritative'>
> = _authoritativeGameStateSchemaObject;

const _assertExactAuthoritativeGameState: AssertExact<
  GameStateForVisibility<'authoritative'>,
  AuthoritativeGameStateSchemaType
> = true;
