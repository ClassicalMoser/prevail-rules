import type { AssertExact } from '@utils';
import type { CommandCard, HiddenCard } from './commandCard';
import { z } from 'zod';
import { commandCardSchema, hiddenCardSchema } from './commandCard';

/** The state of the opposing player's cards. */
export interface HiddenCardState {
  inHand: HiddenCard[];
  awaitingPlay: HiddenCard | null;
  inPlay: CommandCard | null;
  played: CommandCard[];
  discarded: CommandCard[];
  burnt: CommandCard[];
}

/** The schema shape for the state of the opposing player's cards. */
const _hiddenCardStateSchemaObject = z.object({
  inHand: z.array(hiddenCardSchema),
  awaitingPlay: hiddenCardSchema.nullable(),
  inPlay: commandCardSchema.nullable(),
  played: z.array(commandCardSchema),
  discarded: z.array(commandCardSchema),
  burnt: z.array(commandCardSchema),
});

/** The schema type for the state of the opposing player's cards. */
type HiddenCardStateSchemaType = z.infer<typeof _hiddenCardStateSchemaObject>;

/** The schema for the state of the opposing player's cards. */
export const hiddenCardStateSchema: z.ZodType<HiddenCardState> =
  _hiddenCardStateSchemaObject;

// Verify manual type matches schema inference
const _assertExactHiddenCardState: AssertExact<
  HiddenCardState,
  HiddenCardStateSchemaType
> = true;

/** The state of a player's own cards, or both players' cards on the authoritative server. */
export interface OwnedCardState {
  /** The cards in the player's hand, eligible to be played. */
  inHand: CommandCard[];
  /** The facedown card that the player is currently playing. */
  awaitingPlay: CommandCard | null;
  /** The faceup card that is in play.*/
  inPlay: CommandCard | null;
  /** The cards that have been played and are not currently accessible to the player. */
  played: CommandCard[];
  /** The cards that have been discarded and are not currently accessible to the player. */
  discarded: CommandCard[];
  /** The cards that have been burnt and cannot be recovered. */
  burnt: CommandCard[];
}

const _ownedCardStateSchemaObject = z.object({
  /** The cards in the player's hand, eligible to be played. */
  inHand: z.array(commandCardSchema),
  /** The facedown card that the player is currently playing. */
  awaitingPlay: commandCardSchema.nullable(),
  /** The faceup card that is in play.*/
  inPlay: commandCardSchema.nullable(),
  /** The cards that have been played and are not currently accessible to the player. */
  played: z.array(commandCardSchema),
  /** The cards that have been discarded and are not currently accessible to the player. */
  discarded: z.array(commandCardSchema),
  /** The cards that have been burnt and cannot be recovered. */
  burnt: z.array(commandCardSchema),
});

type OwnedCardStateSchemaType = z.infer<typeof _ownedCardStateSchemaObject>;

/** The schema for a player's card state. */
export const ownedCardStateSchema: z.ZodType<OwnedCardState> =
  _ownedCardStateSchemaObject;

// Verify manual type matches schema inference
const _assertExactPlayerCardState: AssertExact<
  OwnedCardState,
  OwnedCardStateSchemaType
> = true;
