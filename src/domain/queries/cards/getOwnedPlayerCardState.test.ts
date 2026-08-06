import { createEmptyGameState } from '@testing';

import { getOwnedPlayerCardState } from './getOwnedPlayerCardState';

/**
 * GetOwnedPlayerCardState: owned slice via visibility discriminant (no casts).
 */
describe(getOwnedPlayerCardState, () => {
  it('given authoritative state, returns either player slice', () => {
    const { cardState } = createEmptyGameState();
    expect(getOwnedPlayerCardState(cardState, 'black')).toBe(cardState.black);
    expect(getOwnedPlayerCardState(cardState, 'white')).toBe(cardState.white);
  });

  it('given blackSeen, returns black and rejects white', () => {
    const cardState = {
      visibility: 'blackSeen' as const,
      black: createEmptyGameState().cardState.black,
      white: {
        awaitingPlay: 'hidden' as const,
        burnt: [],
        discarded: [],
        inHand: ['hidden' as const],
        inPlay: null,
        played: [],
      },
    };
    expect(getOwnedPlayerCardState(cardState, 'black')).toBe(cardState.black);
    expect(() => getOwnedPlayerCardState(cardState, 'white')).toThrow(
      'Player white is not owned under blackSeen visibility',
    );
  });

  it('given whiteSeen, returns white and rejects black', () => {
    const cardState = {
      visibility: 'whiteSeen' as const,
      white: createEmptyGameState().cardState.white,
      black: {
        awaitingPlay: 'hidden' as const,
        burnt: [],
        discarded: [],
        inHand: ['hidden' as const],
        inPlay: null,
        played: [],
      },
    };
    expect(getOwnedPlayerCardState(cardState, 'white')).toBe(cardState.white);
    expect(() => getOwnedPlayerCardState(cardState, 'black')).toThrow(
      'Player black is not owned under whiteSeen visibility',
    );
  });
});
