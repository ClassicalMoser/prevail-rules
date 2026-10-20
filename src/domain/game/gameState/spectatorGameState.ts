import type { AssertExact } from '@utils';
import type { GameStateForVisibility } from './gameStateForVisibility';

import { boardSchema, playerSideSchema, unitInstanceSchema } from '@entities';
import { z } from 'zod';
import { spectatorCardStateSchema } from '@game/cardState';
import { roundStateSchema } from '@game/roundState';

const _spectatorGameStateSchemaObject = z
  .object({
    boardState: boardSchema,
    cardState: spectatorCardStateSchema,
    currentInitiative: playerSideSchema,
    currentRoundNumber: z.int().min(0),
    currentRoundState: roundStateSchema,
    lostCommanders: z.array(playerSideSchema),
    reservedUnits: z.array(unitInstanceSchema),
    routedUnits: z.array(unitInstanceSchema),
    winner: playerSideSchema.nullable().optional(),
  })
  .strict();

type SpectatorGameStateSchemaType = z.infer<
  typeof _spectatorGameStateSchemaObject
>;

/** Schema for spectator {@link GameStateForVisibility}. */
export const spectatorGameStateSchema: z.ZodType<
  GameStateForVisibility<'spectator'>
> = _spectatorGameStateSchemaObject;

const _assertExactSpectatorGameState: AssertExact<
  GameStateForVisibility<'spectator'>,
  SpectatorGameStateSchemaType
> = true;
