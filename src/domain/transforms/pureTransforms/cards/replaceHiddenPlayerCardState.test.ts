import { createEmptyGameState } from '@testing';

import { replaceHiddenPlayerCardState } from './replaceHiddenPlayerCardState';

/**
 * ReplaceHiddenPlayerCardState: swaps one hidden slice inside CardState.
 */
describe(replaceHiddenPlayerCardState, () => {
  it('given authoritative, rejects either player', () => {
    const { cardState } = createEmptyGameState();
    const nextHidden = {
      awaitingPlay: 'hidden' as const,
      burnt: [],
      discarded: [],
      inHand: [] as 'hidden'[],
      inPlay: null,
      played: [],
    };

    expect(() =>
      replaceHiddenPlayerCardState(cardState, 'black', nextHidden),
    ).toThrow('No hidden player under authoritative visibility');
    expect(() =>
      replaceHiddenPlayerCardState(cardState, 'white', nextHidden),
    ).toThrow('No hidden player under authoritative visibility');
  });

  it('given whiteSeen, replaces black and rejects white', () => {
    const base = createEmptyGameState();
    const whiteSeen = {
      visibility: 'whiteSeen' as const,
      white: base.cardState.white,
      black: {
        awaitingPlay: null,
        burnt: [],
        discarded: [],
        inHand: ['hidden' as const],
        inPlay: null,
        played: [],
      },
    };
    const nextBlack = {
      ...whiteSeen.black,
      inHand: [] as 'hidden'[],
    };

    const result = replaceHiddenPlayerCardState(whiteSeen, 'black', nextBlack);

    expect(result.black).toStrictEqual(nextBlack);
    expect(result.white).toBe(whiteSeen.white);
    expect(() =>
      replaceHiddenPlayerCardState(whiteSeen, 'white', nextBlack),
    ).toThrow('Player white is not hidden under whiteSeen visibility');
  });

  it('given blackSeen, replaces white and rejects black', () => {
    const base = createEmptyGameState();
    const blackSeen = {
      visibility: 'blackSeen' as const,
      black: base.cardState.black,
      white: {
        awaitingPlay: null,
        burnt: [],
        discarded: [],
        inHand: ['hidden' as const],
        inPlay: null,
        played: [],
      },
    };
    const nextWhite = {
      ...blackSeen.white,
      inHand: [] as 'hidden'[],
    };

    const result = replaceHiddenPlayerCardState(blackSeen, 'white', nextWhite);

    expect(result.white).toStrictEqual(nextWhite);
    expect(result.black).toBe(blackSeen.black);
    expect(() =>
      replaceHiddenPlayerCardState(blackSeen, 'black', nextWhite),
    ).toThrow('Player black is not hidden under blackSeen visibility');
  });
});
