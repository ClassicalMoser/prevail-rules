import { createEmptyGameState } from '@factories';

import { replaceHiddenPlayerCardState } from './replaceHiddenPlayerCardState';

/**
 * ReplaceHiddenPlayerCardState: swaps one hidden slice inside CardState.
 */
describe('replaceHiddenPlayerCardState function', () => {
  it('given authoritative, rejects either player', () => {
    const { cardState } = createEmptyGameState('standard');
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
    const base = createEmptyGameState('standard');
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
    const base = createEmptyGameState('standard');
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

  it('given spectator, replaces either hidden slice', () => {
    const spectator = {
      visibility: 'spectator' as const,
      black: {
        awaitingPlay: null,
        burnt: [],
        discarded: [],
        inHand: ['hidden' as const],
        inPlay: null,
        played: [],
      },
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
      ...spectator.black,
      inHand: [] as 'hidden'[],
    };

    const nextWhite = {
      ...spectator.white,
      awaitingPlay: null,
    };

    const withBlack = replaceHiddenPlayerCardState(
      spectator,
      'black',
      nextBlack,
    );
    const withWhite = replaceHiddenPlayerCardState(
      spectator,
      'white',
      nextWhite,
    );

    expect(withBlack.visibility).toBe('spectator');
    expect(withBlack.black).toStrictEqual(nextBlack);
    expect(withBlack.white).toBe(spectator.white);
    expect(withWhite.white).toStrictEqual(nextWhite);
    expect(withWhite.black).toBe(spectator.black);
  });
});
