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

  it('accepts committing the in-hand card with all of its melee modifiers', () => {
    const state = stateWhitePendingCommit();
    const event = createCommitToMeleeEvent({
      committedCard: attackCard,
      player: 'white',
    });

    expect(isValidCommitToMeleeEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('accepts committing a card that names two melee stats', () => {
    // A card giving +1 Attack and +1 Defence (§8.2) may be committed as the
    // card it is; the event does not list its stats, so no order can matter.
    const bothStats = createTestCard({ modifiers: ['attack', 'defense'] });
    const state = stateWhitePendingCommit([bothStats]);
    const event = createCommitToMeleeEvent({
      committedCard: bothStats,
      player: 'white',
    });

    expect(isValidCommitToMeleeEvent(event, state)).toStrictEqual({
      result: true,
    });
  });

  it('rejects a card that is not in hand', () => {
    const state = stateWhitePendingCommit();
    const event = createCommitToMeleeEvent({
      committedCard: otherCard,
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
      player: 'white',
    });

    expect(isValidCommitToMeleeEvent(event, state).result).toBe(false);
  });

  it('accepts refusing the melee commitment', () => {
    const state = stateWhitePendingCommit();
    const event = createCommitToMeleeEvent({
      committedCard: null,
      player: 'white',
    });

    expect(isValidCommitToMeleeEvent(event, state)).toStrictEqual({
      result: true,
    });
  });
});
