import { createEmptyGameState } from '@factories';
import { createTestCard, updateCardState } from '@testing';
import { projectGameStateForVisibility } from '@transforms/pureTransforms';

import { applyCommitCardDiscard } from './commitApplyHelpers';

/**
 * Committing a card (§8) is done face up: the card is shown and goes to the
 * discard pile. Every seat folds it, so a seat that cannot see the committing
 * player's hand still learns which card was spent and that one card left that
 * hand.
 */
describe('applyCommitCardDiscard function', () => {
  const committed = createTestCard();
  const kept = createTestCard();

  // The full record, with black holding the card it commits and one more.
  const empty = createEmptyGameState('standard');
  const blackHolding = updateCardState(empty, {
    ...empty.cardState,
    black: { ...empty.cardState.black, inHand: [committed, kept] },
  });

  it("moves the committed card from the committing player's hand to their discard", () => {
    // The full record sees both hands.
    const next = applyCommitCardDiscard(blackHolding, 'black', committed);

    // The card is spent until the next rally (§8.1); the other stays in hand.
    expect(next.cardState.black.inHand).toStrictEqual([kept]);
    expect(next.cardState.black.discarded).toStrictEqual([committed]);
  });

  it("shows a seat the opponent's committed card and takes one hidden card out of that hand", () => {
    // White's seat cannot see black's hand, only that it holds two cards. The
    // commitment is face up, so it can see which card was spent.
    const whiteSeen = projectGameStateForVisibility(blackHolding, 'whiteSeen');

    const next = applyCommitCardDiscard(whiteSeen, 'black', committed);

    // One of the two hidden cards is gone, and the spent card lies in
    // black's discard for everyone to see.
    expect(next.cardState.black.inHand).toStrictEqual(['hidden']);
    expect(next.cardState.black.discarded).toStrictEqual([committed]);
  });

  it('changes nothing when the commitment is refused', () => {
    // Refusing spends no card (§8.3).
    expect(applyCommitCardDiscard(blackHolding, 'black', 'none')).toBe(
      blackHolding,
    );
  });
});
