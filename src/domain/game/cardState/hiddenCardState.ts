import type { CommandCard, HiddenCard } from '@entities';
import type { AssertExact } from '@utils';

import { commandCardSchema, hiddenCardSchema } from '@entities';
import { z } from 'zod';

/**
 * The state of cards that belong to someone other than whoever holds this
 * state: the opponent's, in a seat's view, or both sides', in a spectator's.
 * The hand and the chosen card are face down; the rest is face up.
 */
export interface HiddenCardState {
  /** The cards in the player's hand, face down: how many, not which (§1.4). */
  inHand: HiddenCard[];
  /** The card the player has chosen this round, face down until the reveal. */
  awaitingPlay: HiddenCard | null;
  /** The card in play, face up once revealed. */
  inPlay: CommandCard | null;
  /** The cards played in earlier rounds, face up. */
  played: CommandCard[];
  /** The cards discarded, face up. */
  discarded: CommandCard[];
  /** The cards burnt and out of the game, face up. */
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

/** The schema for card piles that belong to someone other than the holder. */
export const hiddenCardStateSchema: z.ZodType<HiddenCardState> =
  _hiddenCardStateSchemaObject;

const _assertExactHiddenCardState: AssertExact<
  HiddenCardState,
  HiddenCardStateSchemaType
> = true;
