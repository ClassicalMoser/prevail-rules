import type { AssertExact } from '@utils';
import type { GameForVisibility } from './gameForVisibility';

import { z } from 'zod';
import { authoritativeGameSchema } from './authoritativeGame';
import { blackSeenGameSchema } from './blackSeenGame';
import { spectatorGameSchema } from './spectatorGame';
import { whiteSeenGameSchema } from './whiteSeenGame';

/** Every visibility combination. */
export type Game =
  | GameForVisibility<'authoritative'>
  | GameForVisibility<'whiteSeen'>
  | GameForVisibility<'blackSeen'>
  | GameForVisibility<'spectator'>;

const _gameSchemaObject = z.union([
  authoritativeGameSchema,
  whiteSeenGameSchema,
  blackSeenGameSchema,
  spectatorGameSchema,
]);

type GameSchemaType = z.infer<typeof _gameSchemaObject>;

/** Schema for {@link Game} at any visibility. */
export const gameSchema: z.ZodType<Game> = _gameSchemaObject;

const _assertExactGame: AssertExact<Game, GameSchemaType> = true;
