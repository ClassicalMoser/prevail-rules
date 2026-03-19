import type { StandardBoard } from '@entities';
import type { CommitToMovementEvent } from '@events';
import { getMovementResolutionState } from '@queries';
import { commandCards } from '@sampleValues';
import {
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
} from '@testing';
import { updateCardState, updatePhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';
import { applyCommitToMovementEvent } from './applyCommitToMovementEvent';

describe('applyCommitToMovementEvent', () => {
  it('completes commitment and discards card from moving player hand', () => {
    const state = createEmptyGameState();
    const stateWithBlackCardInHand = updateCardState(state, (c) => ({
      ...c,
      black: { ...c.black, inHand: [commandCards[0]] },
    }));
    const movementState = createMovementResolutionState(
      stateWithBlackCardInHand,
      {
        commitment: { commitmentType: 'pending' },
      },
    );
    const stateInPhase = updatePhaseState(
      stateWithBlackCardInHand,
      createIssueCommandsPhaseState(stateWithBlackCardInHand, {
        currentCommandResolutionState: movementState,
      }),
    );
    const event: CommitToMovementEvent<StandardBoard> = {
      eventType: 'playerChoice',
      choiceType: 'commitToMovement',
      player: 'black',
      committedCard: commandCards[0],
      modifierTypes: [],
    };

    const newState = applyCommitToMovementEvent(event, stateInPhase);
    const newMovement = getMovementResolutionState(newState);

    expect(newMovement.commitment).toEqual({
      commitmentType: 'completed',
      card: commandCards[0],
    });
    expect(newState.cardState.black.inHand).toHaveLength(0);
  });
});
