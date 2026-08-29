import type { AssertExact } from '@utils';
import type { GameForVisibility } from './gameForVisibility';

import { armySchema, gameModeNames } from '@entities';
import { z } from 'zod';
import { whiteSeenGameStateSchema } from '@game/gameState';
import { refineGameModeBoardSize } from './refineGameModeBoardSize';

const _whiteSeenGameSchemaObject = z
  .object({
    blackArmy: armySchema,
    blackPlayer: z.uuid(),
    gameMode: z.enum(gameModeNames),
    gameState: whiteSeenGameStateSchema,
    id: z.uuid(),
    whiteArmy: armySchema,
    whitePlayer: z.uuid(),
  })
  .strict()
  .superRefine(refineGameModeBoardSize);

type WhiteSeenGameSchemaType = z.infer<typeof _whiteSeenGameSchemaObject>;

/** Schema for white-seen {@link GameForVisibility}. */
export const whiteSeenGameSchema: z.ZodType<GameForVisibility<'whiteSeen'>> =
  _whiteSeenGameSchemaObject;

const _assertExactWhiteSeenGame: AssertExact<
  GameForVisibility<'whiteSeen'>,
  WhiteSeenGameSchemaType
> = true;
