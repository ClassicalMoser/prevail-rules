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

describe('applyCommitToMeleeEvent', () => {
  it('completes white commitment and discards card from hand', () => {
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

  it('completes black commitment and discards card from hand', () => {
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
