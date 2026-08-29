import type { AssertExact } from '@utils';
import type { GameForVisibility } from './gameForVisibility';

import { z } from 'zod';
import { authoritativeGameSchema } from './authoritativeGame';
import { blackSeenGameSchema } from './blackSeenGame';
import { whiteSeenGameSchema } from './whiteSeenGame';

/** Every visibility combination. */
export type Game =
  | GameForVisibility<'authoritative'>
  | GameForVisibility<'whiteSeen'>
  | GameForVisibility<'blackSeen'>;

const _gameSchemaObject = z.union([
  authoritativeGameSchema,
  whiteSeenGameSchema,
  blackSeenGameSchema,
]);

type GameSchemaType = z.infer<typeof _gameSchemaObject>;

/** Schema for {@link Game} at any visibility. */
export const gameSchema: z.ZodType<Game> = _gameSchemaObject;

const _assertExactGame: AssertExact<Game, GameSchemaType> = true;
