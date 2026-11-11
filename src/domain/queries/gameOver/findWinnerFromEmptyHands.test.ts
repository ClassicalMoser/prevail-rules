import type { CommandCard } from '@entities';
import { createEmptyGameState } from '@factories';
import type { GameState } from '@game';
import { createTestCard } from '@testing';
import { updateCurrentInitiative, updatePlayerCardState } from '@transforms';

import { findWinnerFromEmptyHands } from './findWinnerFromEmptyHands';

/**
 * Empty-hand loss: one empty hand means the other player wins.
 * Both empty at once goes to the holder of initiative (§11.3) —
 * there is no draw in this game. Cards outside the hand do not count.
 */
function withHands(
  whiteHand: CommandCard[],
  blackHand: CommandCard[],
  blackPlayed: CommandCard[] = [],
): GameState {
  const base = createEmptyGameState('standard');
  const white = updatePlayerCardState(base, 'white', {
    ...base.cardState.white,
    inHand: whiteHand,
  });
  const next = updatePlayerCardState(white, 'black', {
    ...white.cardState.black,
    inHand: blackHand,
    played: blackPlayed,
  });
  return next;
}

describe('findWinnerFromEmptyHands function', () => {
  it('continues when both hands have cards', () => {
    const state = withHands([createTestCard()], [createTestCard()]);

    expect(findWinnerFromEmptyHands(state)).toBeUndefined();
  });

  it('black wins when the white hand is empty', () => {
    const state = withHands([], [createTestCard()]);

    expect(findWinnerFromEmptyHands(state)).toBe('black');
  });

  it('white wins when the black hand is empty', () => {
    const state = withHands([createTestCard()], []);

    expect(findWinnerFromEmptyHands(state)).toBe('white');
  });

  it('both hands empty at once go to the player who held initiative', () => {
    // Both last cards were committed face-down before either was revealed,
    // so the tie goes to the initiative held going into the round (§11.3).
    const bothEmpty = withHands([], []);
    // White held initiative going into this round.
    const state = updateCurrentInitiative(bothEmpty, 'white');

    expect(findWinnerFromEmptyHands(state)).toBe('white');
  });

  it('the empty-hands tie follows the initiative, not a fixed colour', () => {
    const bothEmpty = withHands([], []);
    // Black held initiative going into this round.
    const state = updateCurrentInitiative(bothEmpty, 'black');

    expect(findWinnerFromEmptyHands(state)).toBe('black');
  });

  it('a card in the played pile does not fill the hand', () => {
    const state = withHands([createTestCard()], [], [createTestCard()]);

    expect(findWinnerFromEmptyHands(state)).toBe('white');
  });
});
