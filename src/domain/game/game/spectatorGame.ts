import type { AssertExact } from '@utils';
import type { GameForVisibility } from './gameForVisibility';

import { armySchema, gameModeNames } from '@entities';
import { z } from 'zod';
import { spectatorGameStateSchema } from '@game/gameState';

const _spectatorGameSchemaObject = z
  .object({
    blackArmy: armySchema,
    blackPlayer: z.uuid(),
    gameMode: z.enum(gameModeNames),
    gameState: spectatorGameStateSchema,
    id: z.uuid(),
    whiteArmy: armySchema,
    whitePlayer: z.uuid(),
  })
  .strict();

type SpectatorGameSchemaType = z.infer<typeof _spectatorGameSchemaObject>;

/** Schema for spectator {@link GameForVisibility}. */
export const spectatorGameSchema: z.ZodType<GameForVisibility<'spectator'>> =
  _spectatorGameSchemaObject;

const _assertExactSpectatorGame: AssertExact<
  GameForVisibility<'spectator'>,
  SpectatorGameSchemaType
> = true;
