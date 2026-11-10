import type { OwnedCardState } from '@game';
import { createEmptyGameState } from '@factories';
import { createTestCard } from '@testing';
import { toHiddenCardState } from '@transforms';

import { findOwnedPlayerCardState } from './findOwnedPlayerCardState';

function secretPiles(): OwnedCardState {
  return {
    awaitingPlay: createTestCard(),
    burnt: [],
    discarded: [],
    inHand: [createTestCard()],
    inPlay: createTestCard(),
    played: [],
  };
}

describe('findOwnedPlayerCardState function', () => {
  it('finds either hand in the full record', () => {
    const { cardState } = createEmptyGameState('standard');

    expect(findOwnedPlayerCardState(cardState, 'white')).toBe(cardState.white);
    expect(findOwnedPlayerCardState(cardState, 'black')).toBe(cardState.black);
  });

  it("finds a seat's own hand", () => {
    // White's seat sees its own cards.
    const white = secretPiles();
    const whiteSeen = {
      black: toHiddenCardState(secretPiles()),
      visibility: 'whiteSeen' as const,
      white,
    };

    expect(findOwnedPlayerCardState(whiteSeen, 'white')).toBe(white);
  });

  it("answers undefined for the opponent's hand at a seat", () => {
    // Black's cards are hidden from white's seat, which is ordinary, not a
    // fault: white can still refuse a commitment it is asked for.
    const whiteSeen = {
      black: toHiddenCardState(secretPiles()),
      visibility: 'whiteSeen' as const,
      white: secretPiles(),
    };

    expect(findOwnedPlayerCardState(whiteSeen, 'black')).toBeUndefined();
  });

  it('answers undefined for a spectator, who owns no hand', () => {
    const spectator = {
      black: toHiddenCardState(secretPiles()),
      visibility: 'spectator' as const,
      white: toHiddenCardState(secretPiles()),
    };

    expect(findOwnedPlayerCardState(spectator, 'white')).toBeUndefined();
  });
});
