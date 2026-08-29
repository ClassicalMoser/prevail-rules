import type { AssertExact } from '@utils';
import type { GameForVisibility } from './gameForVisibility';

import { armySchema, gameModeNames } from '@entities';
import { z } from 'zod';
import { authoritativeGameStateSchema } from '@game/gameState';
import { refineGameModeBoardSize } from './refineGameModeBoardSize';

const _authoritativeGameSchemaObject = z
  .object({
    blackArmy: armySchema,
    blackPlayer: z.uuid(),
    gameMode: z.enum(gameModeNames),
    gameState: authoritativeGameStateSchema,
    id: z.uuid(),
    whiteArmy: armySchema,
    whitePlayer: z.uuid(),
  })
  .strict()
  .superRefine(refineGameModeBoardSize);

type AuthoritativeGameSchemaType = z.infer<
  typeof _authoritativeGameSchemaObject
>;

/** Schema for authoritative {@link GameForVisibility}. */
export const authoritativeGameSchema: z.ZodType<
  GameForVisibility<'authoritative'>
> = _authoritativeGameSchemaObject;

const _assertExactAuthoritativeGame: AssertExact<
  GameForVisibility<'authoritative'>,
  AuthoritativeGameSchemaType
> = true;
