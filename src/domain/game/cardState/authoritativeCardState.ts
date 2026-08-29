import type { AssertExact } from '@utils';
import type { OwnedCardState } from './ownedCardState';

import { z } from 'zod';
import { ownedCardStateSchema } from './ownedCardState';

/** The state of all cards in the game (full information). */
export interface AuthoritativeCardState {
  /** The visibility regime */
  visibility: 'authoritative';
  /** The state of the cards for the black player. */
  black: OwnedCardState;
  /** The state of the cards for the white player. */
  white: OwnedCardState;
}

const _authoritativeCardStateSchemaObject = z
  .object({
    visibility: z.literal('authoritative'),
    black: ownedCardStateSchema,
    white: ownedCardStateSchema,
  })
  .strict();

type AuthoritativeCardStateSchemaType = z.infer<
  typeof _authoritativeCardStateSchemaObject
>;

/** The schema for authoritative card state. */
export const authoritativeCardStateSchema: z.ZodObject<{
  visibility: z.ZodLiteral<'authoritative'>;
  black: typeof ownedCardStateSchema;
  white: typeof ownedCardStateSchema;
}> = _authoritativeCardStateSchemaObject;

const _assertExactAuthoritativeCardState: AssertExact<
  AuthoritativeCardState,
  AuthoritativeCardStateSchemaType
> = true;
