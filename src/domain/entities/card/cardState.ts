import type { AssertExact } from '@utils';
import type { HiddenCardState, OwnedCardState } from './playerCardState';
import { z } from 'zod';
import { hiddenCardStateSchema, ownedCardStateSchema } from './playerCardState';

/** The state of all cards in the game. */
export interface AuthoritativeCardState {
  /** The visibility regime */
  visibility: 'authoritative';
  /** The state of the cards for the black player. */
  black: OwnedCardState;
  /** The state of the cards for the white player. */
  white: OwnedCardState;
}

const _authoritativeCardStateSchemaObject = z.object({
  /** The visibility regime */
  visibility: z.literal('authoritative'),
  /** The state of the cards for the black player. */
  black: ownedCardStateSchema,
  /** The state of the cards for the white player. */
  white: ownedCardStateSchema,
});

type AuthoritativeCardStateSchemaType = z.infer<
  typeof _authoritativeCardStateSchemaObject
>;

/** The schema for the state of all cards in the game. */
export const authoritativeCardStateSchema: z.ZodType<AuthoritativeCardState> =
  _authoritativeCardStateSchemaObject;

// Verify manual type matches schema inference
const _assertExactFullCardState: AssertExact<
  AuthoritativeCardState,
  AuthoritativeCardStateSchemaType
> = true;

/** The state of the cards visible to the white player. */
export interface WhiteSeenCardState {
  /** The visibility regime */
  visibility: 'whiteSeen';
  /** The state of the cards visible to the white player. */
  white: OwnedCardState;
  /** The state of the cards for the black player. */
  black: HiddenCardState;
}

const _whiteSeenCardStateSchemaObject = z.object({
  /** The visibility regime */
  visibility: z.literal('whiteSeen'),
  /** The state of the cards visible to the white player. */
  white: ownedCardStateSchema,
  /** The state of the cards for the black player. */
  black: hiddenCardStateSchema,
});

type WhiteSeenCardStateSchemaType = z.infer<
  typeof _whiteSeenCardStateSchemaObject
>;

/** The schema for the state of the cards visible to the white player. */
export const whiteSeenCardStateSchema: z.ZodType<WhiteSeenCardState> =
  _whiteSeenCardStateSchemaObject;

// Verify manual type matches schema inference
const _assertExactWhiteSeenCardState: AssertExact<
  WhiteSeenCardState,
  WhiteSeenCardStateSchemaType
> = true;

/** The state of the cards visible to the black player. */
export interface BlackSeenCardState {
  /** The visibility regime */
  visibility: 'blackSeen';
  /** The state of the cards visible to the black player. */
  black: OwnedCardState;
  /** The state of the cards for the white player. */
  white: HiddenCardState;
}

const _blackSeenCardStateSchemaObject = z.object({
  /** The visibility regime */
  visibility: z.literal('blackSeen'),
  /** The state of the cards visible to the black player. */
  black: ownedCardStateSchema,
  /** The state of the cards for the white player. */
  white: hiddenCardStateSchema,
});

type BlackSeenCardStateSchemaType = z.infer<
  typeof _blackSeenCardStateSchemaObject
>;

/** The schema for the state of the cards visible to the black player. */
export const blackSeenCardStateSchema: z.ZodType<BlackSeenCardState> =
  _blackSeenCardStateSchemaObject;

// Verify manual type matches schema inference
const _assertExactBlackSeenCardState: AssertExact<
  BlackSeenCardState,
  BlackSeenCardStateSchemaType
> = true;

/** A full card state, either authoritative, white seen, or black seen. */
export type CardState =
  | AuthoritativeCardState
  | WhiteSeenCardState
  | BlackSeenCardState;

const _cardStateSchemaObject = z.discriminatedUnion('visibility', [
  _authoritativeCardStateSchemaObject,
  _whiteSeenCardStateSchemaObject,
  _blackSeenCardStateSchemaObject,
]);

type CardStateSchemaType = z.infer<typeof _cardStateSchemaObject>;

/** The schema for a full card state, either authoritative, white seen, or black seen. */
export const cardStateSchema: z.ZodType<CardState> = _cardStateSchemaObject;

/** Verify manual type matches schema inference. */
const _assertExactCardState: AssertExact<CardState, CardStateSchemaType> = true;
