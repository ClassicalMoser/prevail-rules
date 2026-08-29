import type { CommandCard } from '@entities';
import type { AssertExact } from '@utils';

import { commandCardSchema } from '@entities';
import { z } from 'zod';

/** The state of a player's own cards, or both players' cards on the authoritative server. */
export interface OwnedCardState {
  /** The cards in the player's hand, eligible to be played. */
  inHand: CommandCard[];
  /** The facedown card that the player is currently playing. */
  awaitingPlay: CommandCard | null;
  /** The faceup card that is in play. */
  inPlay: CommandCard | null;
  /** The cards that have been played and are not currently accessible to the player. */
  played: CommandCard[];
  /** The cards that have been discarded and are not currently accessible to the player. */
  discarded: CommandCard[];
  /** The cards that have been burnt and cannot be recovered. */
  burnt: CommandCard[];
}

const _ownedCardStateSchemaObject = z
  .object({
    inHand: z.array(commandCardSchema),
    awaitingPlay: commandCardSchema.nullable(),
    inPlay: commandCardSchema.nullable(),
    played: z.array(commandCardSchema),
    discarded: z.array(commandCardSchema),
    burnt: z.array(commandCardSchema),
  })
  .strict();

type OwnedCardStateSchemaType = z.infer<typeof _ownedCardStateSchemaObject>;

/** The schema for a player's owned card piles. */
export const ownedCardStateSchema: z.ZodType<OwnedCardState> =
  _ownedCardStateSchemaObject;

const _assertExactOwnedCardState: AssertExact<
  OwnedCardState,
  OwnedCardStateSchemaType
> = true;
