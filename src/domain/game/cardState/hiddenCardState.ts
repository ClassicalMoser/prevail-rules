import type { CommandCard, HiddenCard } from '@entities';
import type { AssertExact } from '@utils';

import { commandCardSchema, hiddenCardSchema } from '@entities';
import { z } from 'zod';

/** The state of the opposing player's cards. */
export interface HiddenCardState {
  inHand: HiddenCard[];
  awaitingPlay: HiddenCard | null;
  inPlay: CommandCard | null;
  played: CommandCard[];
  discarded: CommandCard[];
  burnt: CommandCard[];
}

const _hiddenCardStateSchemaObject = z
  .object({
    inHand: z.array(hiddenCardSchema),
    awaitingPlay: hiddenCardSchema.nullable(),
    inPlay: commandCardSchema.nullable(),
    played: z.array(commandCardSchema),
    discarded: z.array(commandCardSchema),
    burnt: z.array(commandCardSchema),
  })
  .strict();

type HiddenCardStateSchemaType = z.infer<typeof _hiddenCardStateSchemaObject>;

/** The schema for the opposing player's card piles. */
export const hiddenCardStateSchema: z.ZodType<HiddenCardState> =
  _hiddenCardStateSchemaObject;

const _assertExactHiddenCardState: AssertExact<
  HiddenCardState,
  HiddenCardStateSchemaType
> = true;
