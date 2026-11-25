import { tempCommandCards } from '@sampleValues';
import type { HiddenCardState } from '@game';

import { burnHiddenCardFromPlayed } from './burnHiddenCardFromPlayed';

function hiddenWithPlayed(
  played: HiddenCardState['played'],
  burnt: HiddenCardState['burnt'] = [],
): HiddenCardState {
  return {
    awaitingPlay: 'hidden',
    burnt,
    discarded: [],
    inHand: ['hidden'],
    inPlay: null,
    played,
  };
}

describe('burnHiddenCardFromPlayed function', () => {
  it('moves the matching played card onto the public burnt pile', () => {
    const hidden = hiddenWithPlayed([tempCommandCards[0], tempCommandCards[1]]);

    const result = burnHiddenCardFromPlayed(hidden, tempCommandCards[0]);

    expect(result.played).toStrictEqual([tempCommandCards[1]]);
    expect(result.burnt).toStrictEqual([tempCommandCards[0]]);
    expect(result.inHand).toStrictEqual(['hidden']);
  });

  it('burns the played pile’s own copy, not the copy the rally names', () => {
    // The opponent's played card is face up here; the rally names it, who it
    // is, under another name.
    const played = tempCommandCards[0];
    const hidden = hiddenWithPlayed([played]);
    const named = { ...played, name: 'Renamed' };

    const result = burnHiddenCardFromPlayed(hidden, named);

    // The card burnt is the one that was played, as it prints.
    expect(result.burnt).toStrictEqual([played]);
  });

  it('throws when the card is not in the played pile', () => {
    const hidden = hiddenWithPlayed([tempCommandCards[0]]);

    expect(() => burnHiddenCardFromPlayed(hidden, tempCommandCards[1])).toThrow(
      `Command card ${tempCommandCards[1].id} not found in player's played cards`,
    );
  });
});
