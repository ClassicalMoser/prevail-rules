import { createEmptyGameState } from '@testing';

import { getHiddenPlayerCardState } from './getHiddenPlayerCardState';

/**
 * GetHiddenPlayerCardState: hidden slice via visibility discriminant (no casts).
 */
describe(getHiddenPlayerCardState, () => {
  it('given authoritative state, rejects either player', () => {
    const { cardState } = createEmptyGameState();
    expect(() => getHiddenPlayerCardState(cardState, 'black')).toThrow(
      'No hidden player under authoritative visibility',
    );
    expect(() => getHiddenPlayerCardState(cardState, 'white')).toThrow(
      'No hidden player under authoritative visibility',
    );
  });

  it('given whiteSeen, returns black and rejects white', () => {
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
    expect(getHiddenPlayerCardState(cardState, 'black')).toBe(cardState.black);
    expect(() => getHiddenPlayerCardState(cardState, 'white')).toThrow(
      'Player white is not hidden under whiteSeen visibility',
    );
  });

  it('given blackSeen, returns white and rejects black', () => {
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
    expect(getHiddenPlayerCardState(cardState, 'white')).toBe(cardState.white);
    expect(() => getHiddenPlayerCardState(cardState, 'black')).toThrow(
      'Player black is not hidden under blackSeen visibility',
    );
  });
});
