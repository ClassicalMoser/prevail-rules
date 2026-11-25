import {
  createCardState,
  createEmptyGameState,
  createOwnedCardState,
} from '@factories';
import { tempCommandCards } from '@sampleValues';
import { updateCardState } from '@testing';
import { projectGameStateForVisibility } from '@transforms';

import { getTopDiscardedCard } from './getTopDiscardedCard';

/**
 * The card a player discarded last is the one on top of their discard pile.
 * Discards are face up, so every view can read it.
 */
describe('getTopDiscardedCard function', () => {
  // White has discarded two cards, the second one last.
  const first = tempCommandCards[0];
  const last = tempCommandCards[1];
  const state = updateCardState(
    createEmptyGameState('standard'),
    createCardState({
      black: createOwnedCardState({}),
      white: createOwnedCardState({ discarded: [first, last] }),
    }),
  );

  it('returns the card discarded last', () => {
    // The later discard lies on top.
    expect(getTopDiscardedCard(state, 'white')).toBe(last);
  });

  it('reads the same card where the hand is hidden', () => {
    // Black's seat cannot see White's hand, but White's discards are face up.
    const blackSeen = projectGameStateForVisibility(state, 'blackSeen');

    expect(getTopDiscardedCard(blackSeen, 'white')).toStrictEqual(last);
  });

  it('throws for a player who has discarded nothing', () => {
    // Black's discard pile is empty, so there is no top card to read.
    expect(() => getTopDiscardedCard(state, 'black')).toThrow(
      'black has discarded no card',
    );
  });
});
