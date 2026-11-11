import { PLAY_CARDS_PHASE } from '@game';
import {
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createTestCard,
  updateCardState,
} from '@testing';
import { updatePhaseState, updateCurrentInitiative } from '@transforms';

import { getLegalCommitToMeleeEvents } from './getLegalCommitToMeleeEvents';

import { createEmptyGameState } from '@factories';
/**
 * GetLegalCommitToMeleeEvents: one CommitToMeleeEvent per eligible in-hand card
 * (has ≥1 melee modifier), plus a refuse option.
 */
describe('getLegalCommitToMeleeEvents function', () => {
  /** Eligible: carries a melee-applicable attack modifier. */
  const attackCard = createTestCard({ modifiers: ['attack'] });

  function stateWhitePendingCommit(hand = [attackCard]) {
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'white',
    );
    const withCards = updateCardState(base, {
      ...base.cardState,
      white: {
        ...base.cardState.white,
        awaitingPlay: null,
        inHand: hand,
        inPlay: null,
      },
    });
    const melee = createMeleeResolutionState(withCards, {
      firstPlayerCommitment: { commitmentType: 'pending' },
    });
    return updatePhaseState(
      withCards,
      createResolveMeleePhaseState(withCards, {
        currentMeleeResolutionState: melee,
      }),
    );
  }

  it('returns one event per hand card with all of its melee modifiers applied, plus refuse', () => {
    const state = stateWhitePendingCommit([attackCard]);

    expect(getLegalCommitToMeleeEvents(state)).toStrictEqual([
      {
        choiceType: 'commitToMelee',
        committedCard: attackCard,
        eventType: 'playerChoice',
        player: 'white',
      },
      {
        choiceType: 'commitToMelee',
        committedCard: null,
        eventType: 'playerChoice',
        player: 'white',
      },
    ]);
  });

  it('throws when no melee is being fought, where nothing asks', () => {
    const state = updatePhaseState(createEmptyGameState('standard'), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    expect(() => getLegalCommitToMeleeEvents(state)).toThrow(
      'No melee is being fought',
    );
  });

  it('returns only refuse when the pending player has no cards in hand', () => {
    const state = stateWhitePendingCommit([]);
    expect(getLegalCommitToMeleeEvents(state)).toStrictEqual([
      {
        choiceType: 'commitToMelee',
        committedCard: null,
        eventType: 'playerChoice',
        player: 'white',
      },
    ]);
  });
});
