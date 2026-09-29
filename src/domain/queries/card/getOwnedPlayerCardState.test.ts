import type { CardState, OwnedCardState } from '@game';
import { createTestCard } from '@testing';
import { toHiddenCardState } from '@transforms';

import { getOwnedPlayerCardState } from './getOwnedPlayerCardState';

import { createEmptyGameState } from '@factories';

function secretPiles(): OwnedCardState {
  return {
    awaitingPlay: createTestCard({ id: 'awaiting' }),
    burnt: [],
    discarded: [],
    inHand: [createTestCard({ id: 'hand' })],
    inPlay: createTestCard({ id: 'in-play' }),
    played: [],
  };
}

/**
 * GetOwnedPlayerCardState: owned slice via visibility discriminant (no casts).
 */
describe(getOwnedPlayerCardState, () => {
  const whiteSeen = () => {
    const white = secretPiles();
    return {
      black: toHiddenCardState(secretPiles()),
      visibility: 'whiteSeen' as const,
      white,
    };
  };

  const blackSeen = () => {
    const black = secretPiles();
    return {
      black,
      visibility: 'blackSeen' as const,
      white: toHiddenCardState(secretPiles()),
    };
  };

  it('authoritative visibility owns both players', () => {
    const { cardState } = createEmptyGameState('standard');
    expect(getOwnedPlayerCardState(cardState, 'black')).toBe(cardState.black);
    expect(getOwnedPlayerCardState(cardState, 'white')).toBe(cardState.white);
  });

  it('white is owned when white is seen', () => {
    const cardState = whiteSeen();
    const owned = getOwnedPlayerCardState(cardState, 'white');

    expect(owned).toBe(cardState.white);
    expect(owned.inHand).toStrictEqual(cardState.white.inHand);
    expect(owned.inHand).not.toContain('hidden');
    expect(cardState.black.inHand).toStrictEqual(['hidden']);
    expect(cardState.black.awaitingPlay).toBe('hidden');
  });

  it('black is not owned when white is seen', () => {
    expect(() => getOwnedPlayerCardState(whiteSeen(), 'black')).toThrow(
      'Player black is not owned under whiteSeen visibility',
    );
  });

  it('black is owned when black is seen', () => {
    const cardState = blackSeen();
    const owned = getOwnedPlayerCardState(cardState, 'black');

    expect(owned).toBe(cardState.black);
    expect(owned.inHand).toStrictEqual(cardState.black.inHand);
    expect(owned.inHand).not.toContain('hidden');
    expect(cardState.white.inHand).toStrictEqual(['hidden']);
    expect(cardState.white.awaitingPlay).toBe('hidden');
  });

  it('white is not owned when black is seen', () => {
    expect(() => getOwnedPlayerCardState(blackSeen(), 'white')).toThrow(
      'Player white is not owned under blackSeen visibility',
    );
  });

  it('an unknown visibility is rejected', () => {
    const { cardState } = createEmptyGameState('standard');
    expect(() =>
      getOwnedPlayerCardState(
        // Intentionally bad assertion to test the error message
        { ...cardState, visibility: 'nobody' } as unknown as CardState,
        'white',
      ),
    ).toThrow('Invalid visibility: nobody');
  });
});
