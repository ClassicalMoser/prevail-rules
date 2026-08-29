import type { HiddenCardState } from '@game';

import { chooseHiddenCard } from './chooseHiddenCard';

describe(chooseHiddenCard, () => {
  it('moves one hidden card from hand to awaitingPlay', () => {
    const hidden: HiddenCardState = {
      awaitingPlay: null,
      burnt: [],
      discarded: [],
      inHand: ['hidden', 'hidden'],
      inPlay: null,
      played: [],
    };

    const result = chooseHiddenCard(hidden);

    expect(result.inHand).toStrictEqual(['hidden']);
    expect(result.awaitingPlay).toBe('hidden');
  });

  it('throws when hand is empty', () => {
    const hidden: HiddenCardState = {
      awaitingPlay: null,
      burnt: [],
      discarded: [],
      inHand: [],
      inPlay: null,
      played: [],
    };

    expect(() => chooseHiddenCard(hidden)).toThrow(
      'No hidden card available in hand',
    );
  });

  it('throws when awaitingPlay is already set', () => {
    const hidden: HiddenCardState = {
      awaitingPlay: 'hidden',
      burnt: [],
      discarded: [],
      inHand: ['hidden'],
      inPlay: null,
      played: [],
    };

    expect(() => chooseHiddenCard(hidden)).toThrow(
      'Hidden player already has a card awaiting play',
    );
  });
});
