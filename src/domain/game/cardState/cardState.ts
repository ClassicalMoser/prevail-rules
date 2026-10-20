import type { AssertExact } from '@utils';
import type { AuthoritativeCardState } from './authoritativeCardState';
import type { BlackSeenCardState } from './blackSeenCardState';
import type { SpectatorCardState } from './spectatorCardState';
import type { WhiteSeenCardState } from './whiteSeenCardState';

import { z } from 'zod';
import { authoritativeCardStateSchema } from './authoritativeCardState';
import { blackSeenCardStateSchema } from './blackSeenCardState';
import { spectatorCardStateSchema } from './spectatorCardState';
import { whiteSeenCardStateSchema } from './whiteSeenCardState';

/** Card piles under a visibility regime. */
export type CardState =
  | AuthoritativeCardState
  | WhiteSeenCardState
  | BlackSeenCardState
  | SpectatorCardState;

const _cardStateSchemaObject = z.discriminatedUnion('visibility', [
  authoritativeCardStateSchema,
  whiteSeenCardStateSchema,
  blackSeenCardStateSchema,
  spectatorCardStateSchema,
]);

type CardStateSchemaType = z.infer<typeof _cardStateSchemaObject>;

/** The schema for card state under any visibility regime. */
export const cardStateSchema: z.ZodType<CardState> = _cardStateSchemaObject;

const _assertExactCardState: AssertExact<CardState, CardStateSchemaType> = true;
