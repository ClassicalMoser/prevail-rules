import { PLAY_CARDS_PHASE } from '@game';
import { tempCommandCards } from '@sampleValues';
import {
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  updateCardState,
} from '@testing';
import { updatePhaseState, updateCurrentInitiative } from '@transforms';

import { getLegalCommitToMeleeEvents } from './getLegalCommitToMeleeEvents';

import { createEmptyGameState } from '@factories';
/**
 * GetLegalCommitToMeleeEvents: one CommitToMeleeEvent per eligible in-hand card
 * (has ≥1 melee modifier), plus a refuse option; modifierTypes are all of that
 * card's melee modifiers.
 */
describe(getLegalCommitToMeleeEvents, () => {
  function stateWhitePendingCommit(hand = [tempCommandCards[0]]) {
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
      whiteCommitment: { commitmentType: 'pending' },
    });
    return updatePhaseState(
      withCards,
      createResolveMeleePhaseState(withCards, {
        currentMeleeResolutionState: melee,
      }),
    );
  }

  it('returns one event per hand card with all of its melee modifiers applied, plus refuse', () => {
    // tempCommandCards[0] has modifiers: ['attack']
    const state = stateWhitePendingCommit([tempCommandCards[0]]);

    expect(getLegalCommitToMeleeEvents(state)).toStrictEqual([
      {
        choiceType: 'commitToMelee',
        committedCard: tempCommandCards[0],
        eventNumber: 0,
        eventType: 'playerChoice',
        modifierTypes: ['attack'],
        player: 'white',
      },
      {
        choiceType: 'commitToMelee',
        committedCard: null,
        eventNumber: 0,
        eventType: 'playerChoice',
        modifierTypes: [],
        player: 'white',
      },
    ]);
  });

  it('returns empty when not in resolveMelee commitment', () => {
    const state = updatePhaseState(createEmptyGameState('standard'), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    expect(getLegalCommitToMeleeEvents(state)).toStrictEqual([]);
  });

  it('returns only refuse when the pending player has no cards in hand', () => {
    const state = stateWhitePendingCommit([]);
    expect(getLegalCommitToMeleeEvents(state)).toStrictEqual([
      {
        choiceType: 'commitToMelee',
        committedCard: null,
        eventNumber: 0,
        eventType: 'playerChoice',
        modifierTypes: [],
        player: 'white',
      },
    ]);
  });
});
