import type { CommandCard } from '@entities';
import { createEmptyGameState } from '@factories';
import type { GameState } from '@game';
import { createTestCard } from '@testing';
import { updatePlayerCardState } from '@transforms';

import { getWinnerFromEmptyHands } from './getWinnerFromEmptyHands';

/**
 * Empty-hand loss: one empty hand means the other player wins.
 * Both empty is a draw. Cards outside the hand do not count.
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

describe(getWinnerFromEmptyHands, () => {
  it('continues when both hands have cards', () => {
    const state = withHands(
      [createTestCard({ id: 'white-hand' })],
      [createTestCard({ id: 'black-hand' })],
    );

    expect(getWinnerFromEmptyHands(state)).toBeUndefined();
  });

  it('black wins when the white hand is empty', () => {
    const state = withHands([], [createTestCard({ id: 'black-hand' })]);

    expect(getWinnerFromEmptyHands(state)).toBe('black');
  });

  it('white wins when the black hand is empty', () => {
    const state = withHands([createTestCard({ id: 'white-hand' })], []);

    expect(getWinnerFromEmptyHands(state)).toBe('white');
  });

  it('both empty hands are a draw', () => {
    const state = withHands([], []);

    expect(getWinnerFromEmptyHands(state)).toBeNull();
  });

  it('a card in the played pile does not fill the hand', () => {
    const state = withHands(
      [createTestCard({ id: 'white-hand' })],
      [],
      [createTestCard({ id: 'black-played' })],
    );

    expect(getWinnerFromEmptyHands(state)).toBe('white');
  });
});
