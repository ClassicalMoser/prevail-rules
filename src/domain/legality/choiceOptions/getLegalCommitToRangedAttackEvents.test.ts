import { PLAY_CARDS_PHASE } from '@game';
import {
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
  createTestCard,
  updateCardState,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getLegalCommitToRangedAttackEvents } from './getLegalCommitToRangedAttackEvents';

import { createEmptyGameState } from '@factories';
/** Eligible: carries a ranged-applicable attack modifier. */
const attackCard = createTestCard({ modifiers: ['attack'] });
/** Not eligible: speed is a movement modifier, not a ranged one. */
const speedCard = createTestCard({ modifiers: ['speed'] });
/** Eligible: carries a range modifier. */
const rangeCard = createTestCard({ modifiers: ['range'] });

/**
 * GetLegalCommitToRangedAttackEvents: one CommitToRangedAttackEvent per
 * eligible in-hand card (has ≥1 ranged modifier), plus refuse; modifierTypes
 * are all of that card's ranged modifiers.
 */
describe('getLegalCommitToRangedAttackEvents function', () => {
  function statePendingAttackerCommit(hand = [attackCard]) {
    const base = createEmptyGameState('standard');
    const withCards = updateCardState(base, {
      ...base.cardState,
      black: {
        ...base.cardState.black,
        awaitingPlay: null,
        inHand: hand,
        inPlay: null,
      },
    });
    const ranged = createRangedAttackResolutionState(withCards, {
      attackingCommitment: { commitmentType: 'pending' },
    });
    return updatePhaseState(
      withCards,
      createIssueCommandsPhaseState(withCards, {
        currentCommandResolutionState: ranged,
      }),
    );
  }

  function statePendingDefenderCommit(hand = [attackCard]) {
    const base = createEmptyGameState('standard');
    const withCards = updateCardState(base, {
      ...base.cardState,
      white: {
        ...base.cardState.white,
        awaitingPlay: null,
        inHand: hand,
        inPlay: null,
      },
    });
    const ranged = createRangedAttackResolutionState(withCards, {
      defendingCommitment: { commitmentType: 'pending' },
    });
    return updatePhaseState(
      withCards,
      createIssueCommandsPhaseState(withCards, {
        currentCommandResolutionState: ranged,
      }),
    );
  }

  const refuseBlack = {
    choiceType: 'commitToRangedAttack' as const,
    committedCard: null,
    eventNumber: 0,
    eventType: 'playerChoice' as const,
    modifierTypes: [] as const,
    player: 'black' as const,
  };

  const refuseWhite = {
    choiceType: 'commitToRangedAttack' as const,
    committedCard: null,
    eventNumber: 0,
    eventType: 'playerChoice' as const,
    modifierTypes: [] as const,
    player: 'white' as const,
  };

  it('returns one event per hand card with all of its ranged modifiers applied, plus refuse', () => {
    const state = statePendingAttackerCommit([attackCard]);

    expect(getLegalCommitToRangedAttackEvents(state)).toStrictEqual([
      {
        choiceType: 'commitToRangedAttack',
        committedCard: attackCard,
        eventNumber: 0,
        eventType: 'playerChoice',
        modifierTypes: ['attack'],
        player: 'black',
      },
      refuseBlack,
    ]);
  });

  it('skips cards with no ranged-applicable modifiers', () => {
    const state = statePendingAttackerCommit([speedCard, rangeCard]);

    expect(getLegalCommitToRangedAttackEvents(state)).toStrictEqual([
      {
        choiceType: 'commitToRangedAttack',
        committedCard: rangeCard,
        eventNumber: 0,
        eventType: 'playerChoice',
        modifierTypes: ['range'],
        player: 'black',
      },
      refuseBlack,
    ]);
  });

  it('enumerates for the defender when defending commitment is pending', () => {
    const state = statePendingDefenderCommit([attackCard]);

    expect(getLegalCommitToRangedAttackEvents(state)).toStrictEqual([
      {
        choiceType: 'commitToRangedAttack',
        committedCard: attackCard,
        eventNumber: 0,
        eventType: 'playerChoice',
        modifierTypes: ['attack'],
        player: 'white',
      },
      refuseWhite,
    ]);
  });

  it('returns empty when not in issueCommands ranged commitment', () => {
    const state = updatePhaseState(createEmptyGameState('standard'), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    expect(getLegalCommitToRangedAttackEvents(state)).toStrictEqual([]);
  });

  it('returns only refuse when the pending player has no eligible cards in hand', () => {
    const state = statePendingAttackerCommit([speedCard]);
    expect(getLegalCommitToRangedAttackEvents(state)).toStrictEqual([
      refuseBlack,
    ]);
  });
});
