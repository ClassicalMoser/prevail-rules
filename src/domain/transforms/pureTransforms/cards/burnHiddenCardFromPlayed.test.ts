import type { HiddenCardState } from '@game';
import { tempCommandCards } from '@sampleValues';

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

  it('throws when the card is not in the played pile', () => {
    const hidden = hiddenWithPlayed([tempCommandCards[0]]);

    expect(() => burnHiddenCardFromPlayed(hidden, tempCommandCards[1])).toThrow(
      `Command card ${tempCommandCards[1].id} not found in player's played cards`,
    );
  });
});
