import { PLAY_CARDS_PHASE } from '@game';
import {
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
  createTestCard,
  updateCardState,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { isValidCommitToRangedAttackEvent } from './isValidCommitToRangedAttackEvent';

import {
  createCommitToRangedAttackEvent,
  createEmptyGameState,
} from '@factories';

/** Eligible: carries a ranged-applicable attack modifier. */
const attackCard = createTestCard({ modifiers: ['attack'] });
/**
 * Same modifiers as the hand card; a different id so membership (by id) can
 * treat it as not in hand.
 */
const otherCard = createTestCard({
  id: '00000000-0000-4000-8000-ffff00000001',
  modifiers: ['attack'],
});

/**
 * IsValidCommitToRangedAttackEvent: membership against
 * getLegalCommitToRangedAttackEvents.
 */
describe('isValidCommitToRangedAttackEvent function', () => {
  function stateBlackPendingAttackerCommit() {
    const base = createEmptyGameState('standard');
    const withCards = updateCardState(base, {
      ...base.cardState,
      black: {
        ...base.cardState.black,
        awaitingPlay: null,
        inHand: [attackCard],
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
    const event = createCommitToRangedAttackEvent({
      committedCard: attackCard,
      eventNumber: 0,
      modifierTypes: ['attack'],
      player: 'black',
    });

    expect(isValidCommitToRangedAttackEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('rejects committing with an empty modifier list', () => {
    const state = stateBlackPendingAttackerCommit();
    const event = createCommitToRangedAttackEvent({
      committedCard: attackCard,
      eventNumber: 0,
      modifierTypes: [],
      player: 'black',
    });

    expect(isValidCommitToRangedAttackEvent(event, state).result).toBe(false);
  });

  it('rejects a card that is not in hand', () => {
    const state = stateBlackPendingAttackerCommit();
    const event = createCommitToRangedAttackEvent({
      committedCard: otherCard,
      eventNumber: 0,
      modifierTypes: ['attack'],
      player: 'black',
    });

    expect(isValidCommitToRangedAttackEvent(event, state).result).toBe(false);
  });

  it('rejects when commit is not expected', () => {
    const state = updatePhaseState(createEmptyGameState('standard'), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    const event = createCommitToRangedAttackEvent({
      committedCard: attackCard,
      eventNumber: 0,
      modifierTypes: ['attack'],
      player: 'black',
    });

    expect(isValidCommitToRangedAttackEvent(event, state).result).toBe(false);
  });

  it('accepts refusing the ranged commitment', () => {
    const state = stateBlackPendingAttackerCommit();
    const event = createCommitToRangedAttackEvent({
      committedCard: null,
      eventNumber: 0,
      modifierTypes: [],
      player: 'black',
    });

    expect(isValidCommitToRangedAttackEvent(event, state)).toStrictEqual({
      result: true,
    });
  });
});
