import { PLAY_CARDS_PHASE } from '@game';
import {
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createTestCard,
  updateCardState,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { isValidCommitToMovementEvent } from './isValidCommitToMovementEvent';

import { createCommitToMovementEvent, createEmptyGameState } from '@factories';

/** Eligible: carries a movement-applicable speed modifier. */
const speedCard = createTestCard({ modifiers: ['speed'] });
/**
 * Not the hand card. A fresh id keeps membership from matching it.
 */
const otherCard = createTestCard({ modifiers: ['attack'] });

/**
 * IsValidCommitToMovementEvent: membership against getLegalCommitToMovementEvents.
 */
describe('isValidCommitToMovementEvent function', () => {
  function stateBlackPendingCommit() {
    const base = createEmptyGameState('standard');
    const withCards = updateCardState(base, {
      ...base.cardState,
      black: {
        ...base.cardState.black,
        awaitingPlay: null,
        inHand: [speedCard],
        inPlay: null,
      },
    });
    const movement = createMovementResolutionState(withCards, {
      commitment: { commitmentType: 'pending' },
    });
    return updatePhaseState(
      withCards,
      createIssueCommandsPhaseState(withCards, {
        currentCommandResolutionState: movement,
      }),
    );
  }

  it('accepts committing the in-hand card with all of its movement modifiers', () => {
    const state = stateBlackPendingCommit();
    const event = createCommitToMovementEvent({
      committedCard: speedCard,
      player: 'black',
    });

    expect(isValidCommitToMovementEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it("rejects a card that bears a hand card's id but claims stronger stats", () => {
    // The real card lists Speed once. A copy listing it twice would count
    // double as a movement bonus (§8.4).
    const state = stateBlackPendingCommit();
    const event = createCommitToMovementEvent({
      committedCard: { ...speedCard, modifiers: ['speed', 'speed'] },
      player: 'black',
    });

    expect(isValidCommitToMovementEvent(event, state)).toStrictEqual({
      errorReason: `Card ${speedCard.id} differs from the card held in its commit stats`,
      result: false,
    });
  });

  it('accepts refusing with null card and empty modifiers', () => {
    const state = stateBlackPendingCommit();
    const event = createCommitToMovementEvent({
      committedCard: null,
      player: 'black',
    });

    expect(isValidCommitToMovementEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('rejects a card that is not in hand', () => {
    const state = stateBlackPendingCommit();
    const event = createCommitToMovementEvent({
      committedCard: otherCard,
      player: 'black',
    });

    expect(isValidCommitToMovementEvent(event, state).result).toBe(false);
  });

  it('throws when no movement is being carried out, which the expected check rules out first', () => {
    const state = updatePhaseState(createEmptyGameState('standard'), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    const event = createCommitToMovementEvent({
      committedCard: speedCard,
      player: 'black',
    });

    // A choice sent out of turn is refused by the expected check before
    // membership is asked; reaching here is a fault.
    expect(() => isValidCommitToMovementEvent(event, state)).toThrow(
      'No movement is being carried out',
    );
  });
});
