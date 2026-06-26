import type { AssertExact } from '@utils';
import type { Card, HiddenCard } from './card';
import { z } from 'zod';
import { cardSchema, hiddenCardSchema } from './card';

/** The state of the opposing player's cards. */
export interface HiddenCardState {
  inHand: HiddenCard[];
  awaitingPlay: HiddenCard | null;
  inPlay: Card | null;
  played: Card[];
  discarded: Card[];
  burnt: Card[];
}

/** The schema shape for the state of the opposing player's cards. */
const _hiddenCardStateSchemaObject = z.object({
  inHand: z.array(hiddenCardSchema),
  awaitingPlay: hiddenCardSchema.nullable(),
  inPlay: cardSchema.nullable(),
  played: z.array(cardSchema),
  discarded: z.array(cardSchema),
  burnt: z.array(cardSchema),
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
  inHand: Card[];
  /** The facedown card that the player is currently playing. */
  awaitingPlay: Card | null;
  /** The faceup card that is in play.*/
  inPlay: Card | null;
  /** The cards that have been played and are not currently accessible to the player. */
  played: Card[];
  /** The cards that have been discarded and are not currently accessible to the player. */
  discarded: Card[];
  /** The cards that have been burnt and cannot be recovered. */
  burnt: Card[];
}

const _ownedCardStateSchemaObject = z.object({
  /** The cards in the player's hand, eligible to be played. */
  inHand: z.array(cardSchema),
  /** The facedown card that the player is currently playing. */
  awaitingPlay: cardSchema.nullable(),
  /** The faceup card that is in play.*/
  inPlay: cardSchema.nullable(),
  /** The cards that have been played and are not currently accessible to the player. */
  played: z.array(cardSchema),
  /** The cards that have been discarded and are not currently accessible to the player. */
  discarded: z.array(cardSchema),
  /** The cards that have been burnt and cannot be recovered. */
  burnt: z.array(cardSchema),
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
