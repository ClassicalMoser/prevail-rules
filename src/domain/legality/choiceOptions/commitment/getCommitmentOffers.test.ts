import type { OwnedCardState } from '@game';
import { createEmptyGameState } from '@factories';
import { createTestCard } from '@testing';
import { toHiddenCardState, updatePlayerCardState } from '@transforms';

import { getCommitmentOffers } from './getCommitmentOffers';

/** A melee commitment's stats, as the event declares them (§8.4). */
const meleeStats = ['attack', 'defense', 'flexibility'] as const;

describe('getCommitmentOffers function', () => {
  it('offers each useful card with only its useful stats, then the refusal', () => {
    // A Speed-and-Attack card counts in melee for its Attack alone; a
    // Speed-only card is no use in melee and is not offered.
    const speedAndAttack = createTestCard({ modifiers: ['speed', 'attack'] });
    const speedOnly = createTestCard({ modifiers: ['speed'] });
    const empty = createEmptyGameState('standard');
    const state = updatePlayerCardState(empty, 'white', {
      ...empty.cardState.white,
      inHand: [speedOnly, speedAndAttack],
    });

    expect(
      getCommitmentOffers(state.cardState, 'white', meleeStats),
    ).toStrictEqual([
      { committedCard: speedAndAttack, modifierTypes: ['attack'] },
      { committedCard: null, modifierTypes: [] },
    ]);
  });

  it('offers only the refusal from a hand this seat cannot see', () => {
    // White's seat is asked about black's commitment: it may refuse for
    // black, but cannot name black's cards.
    const ownWhite: OwnedCardState = {
      awaitingPlay: null,
      burnt: [],
      discarded: [],
      inHand: [createTestCard({ modifiers: ['attack'] })],
      inPlay: null,
      played: [],
    };
    const whiteSeen = {
      black: toHiddenCardState(ownWhite),
      visibility: 'whiteSeen' as const,
      white: ownWhite,
    };

    expect(getCommitmentOffers(whiteSeen, 'black', meleeStats)).toStrictEqual([
      { committedCard: null, modifierTypes: [] },
    ]);
  });
});
