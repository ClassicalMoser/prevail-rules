import type { CommitToMeleeEvent } from '@events';
import { getMeleeResolutionState } from '@queries';
import { tempCommandCards } from '@sampleValues';
import {
  createEmptyGameState,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  updateCardState,
} from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';

import { applyCommitToMeleeEvent } from './applyCommitToMeleeEvent';

/**
 * Melee commitment: pending side locks in their played command card (and empty modifiers here),
 * moves the card out of hand, and marks `whiteCommitment` / `blackCommitment` completed.
 */
describe(applyCommitToMeleeEvent, () => {
  it('given white pending and one card in hand, commit completes white and empties white hand', () => {
    const state = createEmptyGameState();
    const stateWithWhiteCardInHand = updateCardState(state, {
      ...state.cardState,
      white: { ...state.cardState.white, inHand: [tempCommandCards[0]] },
    });
    const meleeState = createMeleeResolutionState(stateWithWhiteCardInHand, {
      whiteCommitment: { commitmentType: 'pending' },
    });
    const stateInPhase = updatePhaseState(
      stateWithWhiteCardInHand,
      createResolveMeleePhaseState(stateWithWhiteCardInHand, {
        currentMeleeResolutionState: meleeState,
      }),
    );
    const event: CommitToMeleeEvent = {
      choiceType: 'commitToMelee',
      committedCard: tempCommandCards[0],
      eventNumber: 0,
      eventType: 'playerChoice',
      modifierTypes: [],
      player: 'white',
    };

    const newState = applyCommitToMeleeEvent(event, stateInPhase);
    const newMelee = getMeleeResolutionState(newState);

    expect(newMelee.whiteCommitment).toStrictEqual({
      card: tempCommandCards[0],
      commitmentType: 'completed',
    });
    expect(newState.cardState.white.inHand).not.toContainEqual(
      expect.objectContaining({ id: tempCommandCards[0].id }),
    );
    expect(newState.cardState.white.inHand).toHaveLength(0);
  });

  it('given black pending and one card in hand, commit completes black and empties black hand', () => {
    const state = createEmptyGameState();
    const stateWithBlackCardInHand = updateCardState(state, {
      ...state.cardState,
      black: { ...state.cardState.black, inHand: [tempCommandCards[0]] },
    });
    const meleeState = createMeleeResolutionState(stateWithBlackCardInHand, {
      blackCommitment: { commitmentType: 'pending' },
    });
    const stateInPhase = updatePhaseState(
      stateWithBlackCardInHand,
      createResolveMeleePhaseState(stateWithBlackCardInHand, {
        currentMeleeResolutionState: meleeState,
      }),
    );
    const event: CommitToMeleeEvent = {
      choiceType: 'commitToMelee',
      committedCard: tempCommandCards[0],
      eventNumber: 0,
      eventType: 'playerChoice',
      modifierTypes: [],
      player: 'black',
    };

    const newState = applyCommitToMeleeEvent(event, stateInPhase);
    const newMelee = getMeleeResolutionState(newState);

    expect(newMelee.blackCommitment).toStrictEqual({
      card: tempCommandCards[0],
      commitmentType: 'completed',
    });
    expect(newState.cardState.black.inHand).toHaveLength(0);
  });
});
