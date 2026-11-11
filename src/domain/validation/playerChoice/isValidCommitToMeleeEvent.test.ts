import { PLAY_CARDS_PHASE } from '@game';
import {
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createTestCard,
  updateCardState,
} from '@testing';
import { updatePhaseState, updateCurrentInitiative } from '@transforms';

import { isValidCommitToMeleeEvent } from './isValidCommitToMeleeEvent';

import { createCommitToMeleeEvent, createEmptyGameState } from '@factories';

/** Eligible: carries a melee-applicable attack modifier. */
const attackCard = createTestCard({ modifiers: ['attack'] });
/** Same modifiers as the hand card; a fresh id keeps it out of membership. */
const otherCard = createTestCard({ modifiers: ['attack'] });

/**
 * IsValidCommitToMeleeEvent: membership against getLegalCommitToMeleeEvents.
 */
describe('isValidCommitToMeleeEvent function', () => {
  function stateWhitePendingCommit() {
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'white',
    );
    const withCards = updateCardState(base, {
      ...base.cardState,
      white: {
        ...base.cardState.white,
        awaitingPlay: null,
        inHand: [attackCard],
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

  it('accepts committing the in-hand card with all of its melee modifiers', () => {
    const state = stateWhitePendingCommit();
    const event = createCommitToMeleeEvent({
      committedCard: attackCard,
      modifierTypes: ['attack'],
      player: 'white',
    });

    expect(isValidCommitToMeleeEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('rejects committing with an empty modifier list', () => {
    const state = stateWhitePendingCommit();
    const event = createCommitToMeleeEvent({
      committedCard: attackCard,
      modifierTypes: [],
      player: 'white',
    });

    expect(isValidCommitToMeleeEvent(event, state).result).toBe(false);
  });

  it('rejects a card that is not in hand', () => {
    const state = stateWhitePendingCommit();
    const event = createCommitToMeleeEvent({
      committedCard: otherCard,
      modifierTypes: ['attack'],
      player: 'white',
    });

    expect(isValidCommitToMeleeEvent(event, state).result).toBe(false);
  });

  it("rejects a card that bears a hand card's id but claims stronger stats", () => {
    // A player holds one Attack card. Its id is legal, but the card sent
    // lists Attack three times, which would count three times over as a
    // melee bonus (§8.4) if it were taken at its word.
    const state = stateWhitePendingCommit();
    const inflated = {
      ...attackCard,
      modifiers: ['attack', 'attack', 'attack'] as const,
    };
    const event = createCommitToMeleeEvent({
      committedCard: { ...inflated, modifiers: [...inflated.modifiers] },
      modifierTypes: ['attack'],
      player: 'white',
    });

    expect(isValidCommitToMeleeEvent(event, state).result).toBe(false);
  });

  it('rejects when commit is not expected', () => {
    const state = updatePhaseState(createEmptyGameState('standard'), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    const event = createCommitToMeleeEvent({
      committedCard: attackCard,
      modifierTypes: ['attack'],
      player: 'white',
    });

    expect(isValidCommitToMeleeEvent(event, state).result).toBe(false);
  });

  it('accepts refusing the melee commitment', () => {
    const state = stateWhitePendingCommit();
    const event = createCommitToMeleeEvent({
      committedCard: null,
      modifierTypes: [],
      player: 'white',
    });

    expect(isValidCommitToMeleeEvent(event, state)).toStrictEqual({
      result: true,
    });
  });
});
