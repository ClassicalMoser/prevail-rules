import type { AssertExact } from '@utils';
import type { HiddenCardState } from './hiddenCardState';
import type { OwnedCardState } from './ownedCardState';

import { z } from 'zod';
import { hiddenCardStateSchema } from './hiddenCardState';
import { ownedCardStateSchema } from './ownedCardState';

/** The state of the cards visible to the black player. */
export interface BlackSeenCardState {
  /** The visibility regime */
  visibility: 'blackSeen';
  /** The state of the cards visible to the black player. */
  black: OwnedCardState;
  /** The state of the cards for the white player. */
  white: HiddenCardState;
}

const _blackSeenCardStateSchemaObject = z
  .object({
    visibility: z.literal('blackSeen'),
    black: ownedCardStateSchema,
    white: hiddenCardStateSchema,
  })
  .strict();

type BlackSeenCardStateSchemaType = z.infer<
  typeof _blackSeenCardStateSchemaObject
>;

/** The schema for black-seen card state. */
export const blackSeenCardStateSchema: z.ZodObject<{
  visibility: z.ZodLiteral<'blackSeen'>;
  black: typeof ownedCardStateSchema;
  white: typeof hiddenCardStateSchema;
}> = _blackSeenCardStateSchemaObject;

const _assertExactBlackSeenCardState: AssertExact<
  BlackSeenCardState,
  BlackSeenCardStateSchemaType
> = true;
