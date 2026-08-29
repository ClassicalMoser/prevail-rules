import type { AssertExact } from '@utils';
import type { HiddenCardState } from './hiddenCardState';
import type { OwnedCardState } from './ownedCardState';

import { z } from 'zod';
import { hiddenCardStateSchema } from './hiddenCardState';
import { ownedCardStateSchema } from './ownedCardState';

/** The state of the cards visible to the white player. */
export interface WhiteSeenCardState {
  /** The visibility regime */
  visibility: 'whiteSeen';
  /** The state of the cards visible to the white player. */
  white: OwnedCardState;
  /** The state of the cards for the black player. */
  black: HiddenCardState;
}

const _whiteSeenCardStateSchemaObject = z
  .object({
    visibility: z.literal('whiteSeen'),
    white: ownedCardStateSchema,
    black: hiddenCardStateSchema,
  })
  .strict();

type WhiteSeenCardStateSchemaType = z.infer<
  typeof _whiteSeenCardStateSchemaObject
>;

/** The schema for white-seen card state. */
export const whiteSeenCardStateSchema: z.ZodObject<{
  visibility: z.ZodLiteral<'whiteSeen'>;
  white: typeof ownedCardStateSchema;
  black: typeof hiddenCardStateSchema;
}> = _whiteSeenCardStateSchemaObject;

const _assertExactWhiteSeenCardState: AssertExact<
  WhiteSeenCardState,
  WhiteSeenCardStateSchemaType
> = true;
