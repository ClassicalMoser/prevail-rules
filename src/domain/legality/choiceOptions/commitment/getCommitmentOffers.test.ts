import { createEmptyGameState, createOwnedCardState } from '@factories';
import { createTestCard } from '@testing';
import {
  projectGameStateForVisibility,
  updatePlayerCardState,
} from '@transforms';

import { getCommitmentOffers } from './getCommitmentOffers';

/** A melee commitment's stats, as the event declares them (§8.4). */
const meleeStats = ['attack', 'defense', 'flexibility'] as const;

/**
 * A commitment offers each card in hand that names a stat the moment accepts,
 * then the refusal, which is always open (§8.3, §8.4).
 */
describe('getCommitmentOffers function', () => {
  it('offers each useful card with only its useful stats, then the refusal', () => {
    // A Speed-and-Attack card counts in melee for its Attack alone; a
    // Speed-only card is no use in melee and is not offered.
    const speedAndAttack = createTestCard({ modifiers: ['speed', 'attack'] });
    const speedOnly = createTestCard({ modifiers: ['speed'] });
    const state = updatePlayerCardState(
      createEmptyGameState('standard'),
      'white',
      createOwnedCardState({ inHand: [speedOnly, speedAndAttack] }),
    );

    // The useful card, then the refusal last.
    expect(
      getCommitmentOffers(state.cardState, 'white', meleeStats),
    ).toStrictEqual([
      { committedCard: speedAndAttack },
      { committedCard: 'none' },
    ]);
  });

  it('offers only the refusal from a hand this seat cannot see', () => {
    // White's seat is asked about black's commitment: it may refuse for
    // black, but cannot name black's cards.
    // Black really holds an Attack card, which would be offered in full view.
    const authoritative = updatePlayerCardState(
      createEmptyGameState('standard'),
      'black',
      createOwnedCardState({
        inHand: [createTestCard({ modifiers: ['attack'] })],
      }),
    );
    const whiteSeen = projectGameStateForVisibility(authoritative, 'whiteSeen');

    // The refusal alone: the card is face down to this seat.
    expect(
      getCommitmentOffers(whiteSeen.cardState, 'black', meleeStats),
    ).toStrictEqual([{ committedCard: 'none' }]);
  });
});
