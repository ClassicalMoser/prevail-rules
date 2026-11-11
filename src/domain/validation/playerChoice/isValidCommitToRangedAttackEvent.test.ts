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
/** Same modifiers as the hand card; a fresh id keeps it out of membership. */
const otherCard = createTestCard({ modifiers: ['attack'] });

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
      player: 'black',
    });

    expect(isValidCommitToRangedAttackEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it("rejects a card that bears a hand card's id but claims stronger stats", () => {
    // The real card lists Attack once. A copy listing it twice would count
    // double as a shot's attack bonus (§8.4).
    const state = stateBlackPendingAttackerCommit();
    const event = createCommitToRangedAttackEvent({
      committedCard: { ...attackCard, modifiers: ['attack', 'attack'] },
      player: 'black',
    });

    expect(isValidCommitToRangedAttackEvent(event, state)).toStrictEqual({
      errorReason: `Card ${attackCard.id} differs from the card held in its commit stats`,
      result: false,
    });
  });

  it('rejects a card that is not in hand', () => {
    const state = stateBlackPendingAttackerCommit();
    const event = createCommitToRangedAttackEvent({
      committedCard: otherCard,
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
      player: 'black',
    });

    expect(isValidCommitToRangedAttackEvent(event, state).result).toBe(false);
  });

  it('accepts refusing the ranged commitment', () => {
    const state = stateBlackPendingAttackerCommit();
    const event = createCommitToRangedAttackEvent({
      committedCard: null,
      player: 'black',
    });

    expect(isValidCommitToRangedAttackEvent(event, state)).toStrictEqual({
      result: true,
    });
  });
});
