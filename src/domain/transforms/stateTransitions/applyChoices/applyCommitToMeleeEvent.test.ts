import type { StandardBoard } from '@entities';
import type { CommitToMeleeEvent } from '@events';
import { getMeleeResolutionState } from '@queries';
import { commandCards } from '@sampleValues';
import {
  createEmptyGameState,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
} from '@testing';
import { updateCardState, updatePhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';
import { applyCommitToMeleeEvent } from './applyCommitToMeleeEvent';

/**
 * Melee commitment: pending side locks in their played command card (and empty modifiers here),
 * moves the card out of hand, and marks `whiteCommitment` / `blackCommitment` completed.
 */
describe('applyCommitToMeleeEvent', () => {
  it('given white pending and one card in hand, commit completes white and empties white hand', () => {
    const state = createEmptyGameState();
    const stateWithWhiteCardInHand = updateCardState(state, (c) => ({
      ...c,
      white: { ...c.white, inHand: [commandCards[0]] },
    }));
    const meleeState = createMeleeResolutionState(stateWithWhiteCardInHand, {
      whiteCommitment: { commitmentType: 'pending' },
    });
    const stateInPhase = updatePhaseState(
      stateWithWhiteCardInHand,
      createResolveMeleePhaseState(stateWithWhiteCardInHand, {
        currentMeleeResolutionState: meleeState,
      }),
    );
    const event: CommitToMeleeEvent<StandardBoard> = {
      eventType: 'playerChoice',
      choiceType: 'commitToMelee',
      player: 'white',
      committedCard: commandCards[0],
      modifierTypes: [],
    };

    const newState = applyCommitToMeleeEvent(event, stateInPhase);
    const newMelee = getMeleeResolutionState(newState);

    expect(newMelee.whiteCommitment).toEqual({
      commitmentType: 'completed',
      card: commandCards[0],
    });
    expect(newState.cardState.white.inHand).not.toContainEqual(
      expect.objectContaining({ id: commandCards[0].id }),
    );
    expect(newState.cardState.white.inHand).toHaveLength(0);
  });

  it('given black pending and one card in hand, commit completes black and empties black hand', () => {
    const state = createEmptyGameState();
    const stateWithBlackCardInHand = updateCardState(state, (c) => ({
      ...c,
      black: { ...c.black, inHand: [commandCards[0]] },
    }));
    const meleeState = createMeleeResolutionState(stateWithBlackCardInHand, {
      blackCommitment: { commitmentType: 'pending' },
    });
    const stateInPhase = updatePhaseState(
      stateWithBlackCardInHand,
      createResolveMeleePhaseState(stateWithBlackCardInHand, {
        currentMeleeResolutionState: meleeState,
      }),
    );
    const event: CommitToMeleeEvent<StandardBoard> = {
      eventType: 'playerChoice',
      choiceType: 'commitToMelee',
      player: 'black',
      committedCard: commandCards[0],
      modifierTypes: [],
    };

    const newState = applyCommitToMeleeEvent(event, stateInPhase);
    const newMelee = getMeleeResolutionState(newState);

    expect(newMelee.blackCommitment).toEqual({
      commitmentType: 'completed',
      card: commandCards[0],
    });
    expect(newState.cardState.black.inHand).toHaveLength(0);
  });
});
