import { PLAY_CARDS_PHASE } from '@game';
import { tempCommandCards } from '@sampleValues';
import {
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
  updateCardState,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getLegalCommitToRangedAttackEvents } from './getLegalCommitToRangedAttackEvents';

/** Strike: modifiers ['attack'] — eligible for commitToRangedAttack. */
const strikeCard = tempCommandCards[0];
/** Move: modifiers ['speed'] — not eligible for commitToRangedAttack. */
const moveCard = tempCommandCards[4];
/** Socketed Pilum: modifiers ['range'] — eligible. */
const rangeCard = tempCommandCards[15];

/**
 * GetLegalCommitToRangedAttackEvents: one CommitToRangedAttackEvent per
 * eligible in-hand card (has ≥1 ranged modifier); modifierTypes are all of
 * that card's ranged modifiers.
 */
describe(getLegalCommitToRangedAttackEvents, () => {
  function statePendingAttackerCommit(hand = [strikeCard]) {
    const base = createEmptyGameState();
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

  function statePendingDefenderCommit(hand = [strikeCard]) {
    const base = createEmptyGameState();
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

  it('returns one event per hand card with all of its ranged modifiers applied', () => {
    const state = statePendingAttackerCommit([strikeCard]);

    expect(getLegalCommitToRangedAttackEvents(state)).toStrictEqual([
      {
        choiceType: 'commitToRangedAttack',
        committedCard: strikeCard,
        eventNumber: 0,
        eventType: 'playerChoice',
        modifierTypes: ['attack'],
        player: 'black',
      },
    ]);
  });

  it('skips cards with no ranged-applicable modifiers', () => {
    const state = statePendingAttackerCommit([moveCard, rangeCard]);

    expect(getLegalCommitToRangedAttackEvents(state)).toStrictEqual([
      {
        choiceType: 'commitToRangedAttack',
        committedCard: rangeCard,
        eventNumber: 0,
        eventType: 'playerChoice',
        modifierTypes: ['range'],
        player: 'black',
      },
    ]);
  });

  it('enumerates for the defender when defending commitment is pending', () => {
    const state = statePendingDefenderCommit([strikeCard]);

    expect(getLegalCommitToRangedAttackEvents(state)).toStrictEqual([
      {
        choiceType: 'commitToRangedAttack',
        committedCard: strikeCard,
        eventNumber: 0,
        eventType: 'playerChoice',
        modifierTypes: ['attack'],
        player: 'white',
      },
    ]);
  });

  it('returns empty when not in issueCommands ranged commitment', () => {
    const state = updatePhaseState(createEmptyGameState(), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    expect(getLegalCommitToRangedAttackEvents(state)).toStrictEqual([]);
  });

  it('returns empty when the pending player has no eligible cards in hand', () => {
    const state = statePendingAttackerCommit([moveCard]);
    expect(getLegalCommitToRangedAttackEvents(state)).toStrictEqual([]);
  });
});
