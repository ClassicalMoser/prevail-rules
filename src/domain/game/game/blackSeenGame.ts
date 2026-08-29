import type { AssertExact } from '@utils';
import type { GameForVisibility } from './gameForVisibility';

import { armySchema, gameModeNames } from '@entities';
import { z } from 'zod';
import { blackSeenGameStateSchema } from '@game/gameState';
import { refineGameModeBoardSize } from './refineGameModeBoardSize';

const _blackSeenGameSchemaObject = z
  .object({
    blackArmy: armySchema,
    blackPlayer: z.uuid(),
    gameMode: z.enum(gameModeNames),
    gameState: blackSeenGameStateSchema,
    id: z.uuid(),
    whiteArmy: armySchema,
    whitePlayer: z.uuid(),
  })
  .strict()
  .superRefine(refineGameModeBoardSize);

type BlackSeenGameSchemaType = z.infer<typeof _blackSeenGameSchemaObject>;

/** Schema for black-seen {@link GameForVisibility}. */
export const blackSeenGameSchema: z.ZodType<GameForVisibility<'blackSeen'>> =
  _blackSeenGameSchemaObject;

const _assertExactBlackSeenGame: AssertExact<
  GameForVisibility<'blackSeen'>,
  BlackSeenGameSchemaType
> = true;
