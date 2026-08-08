import type { CommitToRangedAttackEvent } from '@events';
import { PLAY_CARDS_PHASE } from '@game';
import { tempCommandCards } from '@sampleValues';
import {
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
  updateCardState,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { isValidCommitToRangedAttackEvent } from './isValidCommitToRangedAttackEvent';

const strikeCard = tempCommandCards[0];
const moveCard = tempCommandCards[4];

/**
 * IsValidCommitToRangedAttackEvent: membership against
 * getLegalCommitToRangedAttackEvents.
 */
describe(isValidCommitToRangedAttackEvent, () => {
  function stateBlackPendingAttackerCommit() {
    const base = createEmptyGameState();
    const withCards = updateCardState(base, {
      ...base.cardState,
      black: {
        ...base.cardState.black,
        awaitingPlay: null,
        inHand: [strikeCard],
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

  it('accepts committing the in-hand card with all of its ranged modifiers', () => {
    const state = stateBlackPendingAttackerCommit();
    const event: CommitToRangedAttackEvent = {
      choiceType: 'commitToRangedAttack',
      committedCard: strikeCard,
      eventNumber: 0,
      eventType: 'playerChoice',
      modifierTypes: ['attack'],
      player: 'black',
    };

    expect(isValidCommitToRangedAttackEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('rejects committing with an empty modifier list', () => {
    const state = stateBlackPendingAttackerCommit();
    const event: CommitToRangedAttackEvent = {
      choiceType: 'commitToRangedAttack',
      committedCard: strikeCard,
      eventNumber: 0,
      eventType: 'playerChoice',
      modifierTypes: [],
      player: 'black',
    };

    expect(isValidCommitToRangedAttackEvent(event, state).result).toBe(false);
  });

  it('rejects a card that is not in hand', () => {
    const state = stateBlackPendingAttackerCommit();
    const event: CommitToRangedAttackEvent = {
      choiceType: 'commitToRangedAttack',
      committedCard: moveCard,
      eventNumber: 0,
      eventType: 'playerChoice',
      modifierTypes: ['attack'],
      player: 'black',
    };

    expect(isValidCommitToRangedAttackEvent(event, state).result).toBe(false);
  });

  it('rejects when commit is not expected', () => {
    const state = updatePhaseState(createEmptyGameState(), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    const event: CommitToRangedAttackEvent = {
      choiceType: 'commitToRangedAttack',
      committedCard: strikeCard,
      eventNumber: 0,
      eventType: 'playerChoice',
      modifierTypes: ['attack'],
      player: 'black',
    };

    expect(isValidCommitToRangedAttackEvent(event, state).result).toBe(false);
  });
});
