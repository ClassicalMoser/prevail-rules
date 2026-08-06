import { tempCommandCards } from '@sampleValues';
import { createEmptyGameState } from '@testing';

import { replaceOwnedPlayerCardState } from './replaceOwnedPlayerCardState';

/**
 * ReplaceOwnedPlayerCardState: swaps one owned slice inside CardState.
 */
describe(replaceOwnedPlayerCardState, () => {
  it('given authoritative, replaces the named player slice', () => {
    const { cardState } = createEmptyGameState();
    const nextBlack = {
      ...cardState.black,
      inHand: [tempCommandCards[0]],
    };

    const result = replaceOwnedPlayerCardState(cardState, 'black', nextBlack);

    expect(result.visibility).toBe('authoritative');
    expect(result.black).toStrictEqual(nextBlack);
    expect(result.white).toBe(cardState.white);
  });

  it('given whiteSeen, replaces white and rejects black', () => {
    const base = createEmptyGameState();
    const whiteSeen = {
      visibility: 'whiteSeen' as const,
      white: base.cardState.white,
      black: {
        awaitingPlay: 'hidden' as const,
        burnt: [],
        discarded: [],
        inHand: ['hidden' as const],
        inPlay: null,
        played: [],
      },
    };
    const nextWhite = {
      ...whiteSeen.white,
      inHand: [tempCommandCards[1]],
    };

    const result = replaceOwnedPlayerCardState(whiteSeen, 'white', nextWhite);

    expect(result.white).toStrictEqual(nextWhite);
    expect(() =>
      replaceOwnedPlayerCardState(whiteSeen, 'black', nextWhite),
    ).toThrow('Player black is not owned under whiteSeen visibility');
  });

  it('given blackSeen, replaces black and rejects white', () => {
    const base = createEmptyGameState();
    const blackSeen = {
      visibility: 'blackSeen' as const,
      black: base.cardState.black,
      white: {
        awaitingPlay: 'hidden' as const,
        burnt: [],
        discarded: [],
        inHand: ['hidden' as const],
        inPlay: null,
        played: [],
      },
    };
    const nextBlack = {
      ...blackSeen.black,
      inHand: [tempCommandCards[0]],
    };

    const result = replaceOwnedPlayerCardState(blackSeen, 'black', nextBlack);

    expect(result.black).toStrictEqual(nextBlack);
    expect(() =>
      replaceOwnedPlayerCardState(blackSeen, 'white', nextBlack),
    ).toThrow('Player white is not owned under blackSeen visibility');
  });
});
